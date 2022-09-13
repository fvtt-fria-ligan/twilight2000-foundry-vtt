const NEEDS_MIGRATION_VERSION = '1.5.0';
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

/* -------------------------------------------- */

/**
 * Performs a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise} A Promise which resolves once the migration is completed
 */
export async function migrateWorld() {
  // const migrateDialog = new Dialog({
  //   title: 'T2K4E | System Migration',
  //   content: 'Migration in progress, please wait...',
  //   buttons: {},
  // }).render(true);

  ui.notifications.info(
    `Applying T2K System Migration for version ${game.system.data.version}.`
    + ' Please be patient and do not close your game or shut down your server.',
    { permanent: true },
  );

  // Migrates World Actors.
  for (const a of game.actors.contents) {
    try {
      const updateData = migrateActorData(a);
      if (!foundry.utils.isEmpty(updateData)) {
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
      if (!foundry.utils.isEmpty(updateData)) {
        console.log(`t2k4e | Migrating Item entity ${i.name}`);
        await i.update(updateData, { enforceTypes: false });
      }
    }
    catch (err) {
      err.message = `Failed T2K system migration for Item ${i.name}: ${err.message}`;
      console.error(err);
    }
  }

  // Migrates Actor Override Tokens.
  for (const s of game.scenes.contents) {
    try {
      const updateData = migrateSceneData(s);
      if (!foundry.utils.isEmpty(updateData)) {
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

  // Migrates World Compendium Packs.
  for (const p of game.packs) {
    if (p.metadata.package !== 'world') continue;
    if (!['Actor', 'Item', 'Scene'].includes(p.metadata.entity)) continue;
    await migrateCompendium(p);
  }


  // Sets the migration as complete.
  game.settings.set('t2k4e', 'systemMigrationVersion', game.system.data.version);
  ui.notifications.info(`T2K System Migration to version ${game.system.data.version} completed!`, { permanent: true });
  // migrateDialog.close();
}

/* -------------------------------------------- */

/**
 * Applies migration rules to all Entities within a single Compendium pack.
 * @param pack
 * @return {Promise}
 * @async
 */
export async function migrateCompendium(pack) {
  const entity = pack.metadata.entity;
  if (!['Actor', 'Item', 'Scene'].includes(entity)) return;

  // Unlocks the pack for editing.
  const wasLocked = pack.locked;
  await pack.configure({ locked: false });

  // Begins by requesting server-side data model migration and get the migrated content.
  await pack.migrate();
  const documents = await pack.getDocuments();

  // Iterates over compendium entries - applying fine-tuned migration functions.
  for (const doc of documents) {
    let updateData = {};
    try {
      switch (entity) {
        case 'Actor':
          updateData = migrateActorData(doc);
          break;
        case 'Item':
          updateData = migrateItemData(doc.toObject());
          break;
        case 'Scene':
          updateData = migrateSceneData(doc);
          break;
      }

      // Saves the entry, if data was changed.
      if (foundry.utils.isEmpty(updateData)) continue;
      await doc.update(updateData);
      console.log(`Migrated ${entity} entity ${doc.name} in Compendium ${pack.collection}`);
    }

    // Handles migration failures.
    catch(err) {
      err.message = `Failed T2K system migration for entity ${doc.name} in pack ${pack.collection}: ${err.message}`;
      console.error(err);
    }
  }

  // Applies the original locked status for the pack.
  await pack.configure({ locked: wasLocked });
  console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
}

/* -------------------------------------------- */
/*  Entity Type Migration Helpers               */
/* -------------------------------------------- */

/**
 * Migrates a single Actor entity to incorporate latest data model changes.
 * @param {Actor} actorData The actor data object to update
 * @returns {object} The updateData to apply
 */
export function migrateActorData(actorData) {
  const updateData = {};

  if (actorData.system) {
    if (actorData.type === 'character') {
      _migrateCharacterInjuries(actorData, updateData);
    }
    else if (actorData.type === 'vehicle') {
      _migrateVehicleReliability(actorData, updateData);
      _migrateVehicleCrew(actorData, updateData);
      _migrateVehicleComponents(actorData, updateData);
      _migrateVehicleArmor(actorData, updateData);
    }
  }

  // Migrates owned items.
  if (actorData.items) {
    const items = actorData.items.reduce((arr, i) => {
      // Migrates
      const itemData = i instanceof CONFIG.Item.documentClass ? i.toObject() : i;
      const itemUpdate = migrateItemData(itemData);

      // Updates
      if (!foundry.utils.isEmpty(itemUpdate)) {
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
  if (itemData.system && itemData.type !== 'ammunition') {
    _migrateRollModifiers(itemData, updateData);
  }
  switch (itemData.type) {
    case 'weapon':
      _migrateWeaponProps(itemData, updateData);
      _migrateWeaponReliability(itemData, updateData);
      _migrateWeaponAmmo(itemData, updateData);
      break;
    case 'gear':
      _migrateGearReliability(itemData, updateData);
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
export function migrateSceneData(sceneData) {
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
 * Migrates the roll modifiers of an item.
 * @param {object} itemData
 * @param {object} updateData
 * @private
 */
function _migrateRollModifiers(itemData, updateData) {
  if (itemData.system.rollModifiers == undefined) {
    const rollModifiers = {};
    if (itemData.system.modifiers != undefined) {
      const modifiers = itemData.system.modifiers;
      let i = 0;
      // Iterates over each attribute modifier
      // & over each skill modifier.
      for (const cat in modifiers) {
        for (const m in modifiers[cat]) {
          const value = modifiers[cat][m];
          if (value) {
            rollModifiers[i] = {
              name: `${cat.slice(0, -1)}.${m}`,
              value,
            };
            i++;
          }
        }
      }
    }
    updateData['system.rollModifiers'] = rollModifiers;
  }
  return updateData;
}

/**
 * Migrates the props of a weapon.
 * @param {object} itemData
 * @param {object} updateData
 * @private
 */
function _migrateWeaponProps(itemData, updateData) {
  // New PROPERTIES
  const newProps = ['armored', 'bipod', 'tripod', 'scope', 'nightVision', 'bayonet', 'suppressor'];
  for (const np of newProps) {
    if (itemData.system.props[np] == undefined) {
      updateData[`system.props.${np}`] = false;
    }
  }
  // Remove old properties
  updateData['system.props.-=sight'] = null;

  // New FEATURES for vehicle
  if (itemData.system.featuresForVehicle == undefined) {
    // Creates a new default structure for vehicle features.
    const featuresForVehicle = {
      'p': false,
      'pg': false,
      't': false,
      'c': false,
      'h': false,
      's': false,
      'fcs': false,
      'ir': false,
      'tm': false,
    };
    updateData['system.featuresForVehicle'] = featuresForVehicle;
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
  const rel = itemData.system.reliability;
  if (rel.score !== undefined) {
    updateData['system.reliability.value'] = RELIABILITY_VALUES[rel.score];
    updateData['system.reliability.max'] = RELIABILITY_VALUES[rel.max];
    // Deletes old properties.
    updateData['system.reliability.-=score'] = null;
  }
  return updateData;
}

/**
 * Migrates the weapon's ammunition.
 * @param {object} itemData
 * @param {object} updateData
 */
function _migrateWeaponAmmo(itemData, updateData) {
  const mag = itemData.system.mag;
  if (mag.target == undefined) {
    updateData['system.mag.target'] = '';
    // Deletes old properties.
    updateData['system.mag.-=value'] = null;
  }
  return updateData;
}

/**
 * Migrates the Gear reliability.
 * @param {object} itemData
 * @param {object} updateData
 * @private
 */
function _migrateGearReliability(itemData, updateData) {
  if (itemData.system.reliability == undefined) {
    updateData['system.reliability'] = { value: null, max: null };
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
  const crits = actorData.system.crits;
  if (crits != undefined) {
    // Deletes old properties.
    updateData['system.-=crits'] = null;
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
  const rel = actorData.system.reliability;
  if (rel.score != undefined) {
    updateData['system.reliability.value'] = RELIABILITY_VALUES[rel.score];
    updateData['system.reliability.max'] = RELIABILITY_VALUES[rel.maxScore];
    // Deletes old properties.
    updateData['system.reliability.-=score'] = null;
    updateData['system.reliability.-=maxScore'] = null;
  }
  return updateData;
}

/**
 * Migrates the Vehicle's crew system.
 * @param {object} actorData
 * @param {object} updateData
 * @private
 */
function _migrateVehicleCrew(actorData, updateData) {
  const oldCrew = actorData.system.crew;
  if (oldCrew.driver != undefined) {
    updateData['system.crew.qty'] = oldCrew.driver;
    updateData['system.crew.passengerQty'] = oldCrew.passenger;
    updateData['system.crew.occupants'] = [];
    // Deletes old properties.
    updateData['system.crew.-=driver'] = null;
    updateData['system.crew.-=passenger'] = null;
    updateData['system.crew.-=exposedPassenger'] = null;
    updateData['system.crew.-=gunner'] = null;
    updateData['system.crew.-=commander'] = null;
  }
  return updateData;
}

/**
 * Migrates the Vehicle's components system.
 * @param {object} actorData
 * @param {object} updateData
 * @private
 */
function _migrateVehicleComponents(actorData, updateData) {
  if (actorData.system.components?.fuel?.value !== undefined) {
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
    updateData['system.components'] = newComp;
    updateData['system.components.-=ammo'] = null;
    updateData['system.components.-=cargo'] = null;
    updateData['system.components.-=externalStores'] = null;
    updateData['system.components.-=weapon'] = null;
    // Deletes old properties.
    updateData['system.-=tempComponents'] = null;
  }
  return updateData;
}

/**
 * Migrates the Vehicle's armor system.
 * @param {object} actorData
 * @param {object} updateData
 * @private
 */
function _migrateVehicleArmor(actorData, updateData) {
  const armor = actorData.system.armor || {};
  if (armor.side?.value != undefined) {
    updateData['system.armor.left'] = {
      value: +armor.side.value,
      max: +armor.side.max,
    };
    updateData['system.armor.right'] = {
      value: +armor.side.value,
      max: +armor.side.max,
    };
    // Deletes old properties.
    updateData['system.armor.-=side'] = null;
  }
  return updateData;
}
