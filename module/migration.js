const NEEDS_MIGRATION_VERSION = '1.0.0';
const COMPATIBLE_MIGRATION_VERSION = '0.7.3';

/**
 * Determines whether a system migration is required and feasible.
 * @see https://gitlab.com/foundrynet/dnd5e/-/blob/master/module/migration.js
 */
export function checkMigration() {
  if (!game.user.isGM) return;

  const currentVersion = game.settings.get('t2k4e', 'systemMigrationVersion');
  const totalDocuments = game.actors.size + game.scenes.size + game.items.size;

  if (!currentVersion && totalDocuments === 0) {
    return game.settings.set('t2k4e', 'systemMigrationVersion', game.system.data.version);
  }

  const needsMigration = !currentVersion || foundry.utils.isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion);
  if (!needsMigration) return;

  // Performs the migration.
  if (currentVersion && foundry.utils.isNewerVersion(COMPATIBLE_MIGRATION_VERSION, currentVersion)) {
    const warning = 'Your T2K system data is from too old a Foundry version and cannot be reliably migrated to'
      + ' the latest version. The process will be attempted, but errors may occur.';
    ui.notifications.error(warning, { permanent: true });
  }
  migrateWorld();
}

/**
 * Performs a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise} A Promise which resolves once the migration is completed
 */
async function migrateWorld() {
  ui.notifications.info(
    `Applying T2K System Migration for version ${game.system.data.version}.`
    + ' Please be patient and do not close your game or shut down your server.',
    { permanent: true },
  );

  // Migrates World Actors.
  for (const a of game.actors.contents) {
    try {
      const updateData = migrateActorData(a.data);
      if (!foundry.utils.isObjectEmpty(updateData)) {
        console.log(`t2k4e | Migrating Actor entity ${a.name}`);
        await a.update(updateData, { enforceTypes: false });
      }
    }
    catch (err) {
      err.message = `Failed T2K system migration for Actor ${a.name}: ${err.message}`;
      console.error(err);
    }
  }

  // Migrates World Items.
  for (const i of game.items.contents) {
    try {
      const updateData = migrateItemData(i.toObject());
      if (!foundry.utils.isObjectEmpty(updateData)) {
        console.log(`t2k4e | Migrating Item entity ${i.name}`);
        await i.update(updateData, { enforceTypes: false });
      }
    }
    catch (err) {
      err.message = `Failed T2K system migration for Item ${i.name}: ${err.message}`;
      console.error(err);
    }
  }

  // Migrates Actor Override Tokens
  for (const s of game.scenes.contents) {
    try {
      const updateData = migrateSceneData(s.data);
      if (!foundry.utils.isObjectEmpty(updateData)) {
        console.log(`t2k4e | Migrating Scene entity ${s.name}`);
        await s.update(updateData, { enforceTypes: false });
        // If we do not do this, then synthetic token actors remain in cache
        // with the un-updated actorData.
        s.tokens.contents.forEach(t => t._actor = null);

      }
    }
    catch (err) {
      err.message = `Failed T2K system migration for Scene ${s.name}: ${err.message}`;
      console.error(err);
    }
  }

  // Sets the migration as complete.
  game.settings.set('t2k4e', 'systemMigrationVersion', game.system.data.version);
  ui.notifications.info(`T2K System Migration to version ${game.system.data.version} completed!`, { permanent: true });
}

/* -------------------------------------------- */
/*  Entity Type Migration Helpers               */
/* -------------------------------------------- */

/**
 * Migrates a single Actor entity to incorporate latest data model changes.
 * @param {Actor} actorData The actor data object to update
 * @returns {object} The updateData to apply
 */
function migrateActorData(actorData) {
  const updateData = {};

  if (actorData.data) {
    if (actorData.type === 'character') {
      _migrateCharacterInjuries(actorData, updateData);
    }
    else if (actorData.type === 'vehicle') {
      _migrateVehicleReliability(actorData, updateData);
      _migrateVehicleCrew(actorData, updateData);
      _migrateVehicleComponents(actorData, updateData);
    }
  }

  // Migrates owned items.
  if (actorData.items) {
    const items = actorData.items.reduce((arr, i) => {
      // Migrates
      const itemData = i instanceof CONFIG.Item.documentClass ? i.toObject() : i;
      const itemUpdate = migrateItemData(itemData);

      // Updates
      if (!foundry.utils.isObjectEmpty(itemUpdate)) {
        itemUpdate._id = itemData._id;
        arr.push(foundry.utils.expandObject(itemUpdate));
      }

      return arr;
    }, []);

    if (items.length > 0) updateData.items = items;
  }
  return updateData;
}

/* -------------------------------------------- */

/**
 * Migrates a single Item entity to incorporate latest data model changes.
 * @param {object} itemData Item data to migrate
 * @return {object} The updateData to apply
 */
export function migrateItemData(itemData) {
  const updateData = {};
  switch (itemData.type) {
    case 'weapon':
      _migrateWeaponProps(itemData, updateData);
      _migrateWeaponReliability(itemData, updateData);
      _migrateWeaponAmmo(itemData, updateData);
      break;
  }
  return updateData;
}

/* -------------------------------------------- */

/**
 * Migrates a single Scene entity to incorporate changes to the data model of it's actor data overrides.
 * @param {object} sceneData The Scene data to Update
 * @return {object} The updateData to apply
 */
function migrateSceneData(sceneData) {
  const tokens = sceneData.tokens.map(token => {
    const t = token.toJSON();
    if (!t.actorId || t.actorLink) {
      t.actorData = {};
    }
    else if (!game.actors.has(t.actorId)) {
      t.actorId = null;
      t.actorData = {};
    }
    else if (!t.actorLink) {
      const actorData = duplicate(t.actorData);
      actorData.type = token.actor?.type;
      const update = migrateActorData(actorData);
      ['items', 'effects'].forEach(embeddedName => {
        if (!update[embeddedName]?.length) return;
        const updates = new Map(update[embeddedName].map(u => [u._id, u]));
        t.actorData[embeddedName].forEach(original => {
          const upd = updates.get(original._id);
          if (upd) foundry.utils.mergeObject(original, upd);
        });
        delete update[embeddedName];
      });

      foundry.utils.mergeObject(t.actorData, update);
    }
    return t;
  });
  return { tokens };
}

/* -------------------------------------------- */
/*  Low level migration utilities
/* -------------------------------------------- */

const RELIABILITY_VALUES = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'F': 1, '–': 0 };

/**
 * Migrates the props of a weapon.
 * @param {object} itemData
 * @param {object} updateData
 * @private
 */
function _migrateWeaponProps(itemData, updateData) {
  if (itemData.data.props?.armored == undefined) {
    updateData['data.props.armored'] = false;
  }
  return updateData;
}

/**
 * Migrates the Reliability score of a weapon.
 * @param {object} itemData
 * @param {object} updateData
 * @private
 */
function _migrateWeaponReliability(itemData, updateData) {
  const rel = itemData.data.reliability;
  if (rel.score !== undefined) {
    updateData['data.reliability.value'] = RELIABILITY_VALUES[rel.score];
    updateData['data.reliability.max'] = RELIABILITY_VALUES[rel.max];
    // Deletes old properties.
    updateData['data.reliability.-=score'] = null;
  }
  return updateData;
}

/**
 * Migrates the weapon's ammunition.
 * @param {object} itemData
 * @param {object} updateData
 */
function _migrateWeaponAmmo(itemData, updateData) {
  const mag = itemData.data.mag;
  if (mag.target == undefined) {
    updateData['data.mag.target'] = '';
    // Deletes old properties.
    updateData['data.mag.-=value'] = null;
  }
  return updateData;
}

/**
 * Migrates a character's injuries.
 * @param {object} actorData
 * @param {object} updateData
 * @private
 */
function _migrateCharacterInjuries(actorData, updateData) {
  const crits = actorData.data.crits;
  if (crits != undefined) {
    // Deletes old properties.
    updateData['data.-=crits'] = null;
  }
  return updateData;
}

/**
 * Migrates the Reliability score of a vehicle.
 * @param {object} actorData
 * @param {object} updateData
 * @private
 */
function _migrateVehicleReliability(actorData, updateData) {
  const rel = actorData.data.reliability;
  if (rel.score != undefined) {
    updateData['data.reliability.value'] = RELIABILITY_VALUES[rel.score];
    updateData['data.reliability.max'] = RELIABILITY_VALUES[rel.maxScore];
    // Deletes old properties.
    updateData['data.reliability.-=score'] = null;
    updateData['data.reliability.-=maxScore'] = null;
  }
  return updateData;
}

/**
 * Migrates the Vehicle's crew data.
 * @param {object} actorData
 * @param {object} updateData
 * @private
 */
function _migrateVehicleCrew(actorData, updateData) {
  const oldCrew = actorData.data.crew;
  if (oldCrew.driver != undefined) {
    updateData['data.crew.qty'] = oldCrew.driver;
    updateData['data.crew.passengerQty'] = oldCrew.passenger;
    updateData['data.crew.occupants'] = [];
    // Deletes old properties.
    updateData['data.crew.-=driver'] = null;
    updateData['data.crew.-=passenger'] = null;
    updateData['data.crew.-=exposedPassenger'] = null;
    updateData['data.crew.-=gunner'] = null;
    updateData['data.crew.-=commander'] = null;
  }
  return updateData;
}

/**
 * Migrates the Vehicle's components data.
 * @param {object} actorData
 * @param {object} updateData
 * @private
 */
function _migrateVehicleComponents(actorData, updateData) {
  const oldComp = actorData.data.components;
  if (oldComp.fuel?.value !== undefined) {
    // Creates a new default components structure.
    const newComp = {
      'fuel': {
        'active': true,
        'damage': 0,
      },
      'engine': {
        'active': true,
        'damage': 0,
      },
      'suspension': {
        'active': true,
        'damage': 0,
      },
      'ammunition': {
        'active': true,
        'damage': 0,
      },
      'radio': {
        'active': true,
        'reliability': {
          'value': 1,
          'max': 1,
        },
      },
      'trackWheel': {
        'active': true,
        'damage': 0,
      },
      'fcs': {
        'active': false,
        'damage': 0,
        'type': '',
      },
      'antenna': {
        'active': true,
        'damage': 0,
      },
    };
    // Overwrites the old components properties.
    updateData['data.components'] = newComp;
    updateData['data.components.-=ammo'] = null;
    updateData['data.components.-=cargo'] = null;
    updateData['data.components.-=externalStores'] = null;
    updateData['data.components.-=weapon'] = null;
    // Deletes old properties.
    updateData['data.-=tempComponents'] = null;
  }
  return updateData;
}