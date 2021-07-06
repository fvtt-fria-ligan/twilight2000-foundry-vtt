const NEEDS_MIGRATION_VERSION = '1.0.0';
const COMPATIBLE_MIGRATION_VERSION = '0.7';

/**
 * Determines whether a system migration is required and feasible.
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
export async function migrateWorld() {
  ui.notifications.info(
    `Applying T2K System Migration for version ${game.system.data.version}.`
    + ' Please be patient and do not close your game or shut down your server.',
    { permanent: true },
  );

  // Sets the migration as complete.
  //game.settings.set('t2k4e', 'systemMigrationVersion', game.system.data.version);
  ui.notifications.info(`T2K System Migration to version ${game.system.data.version} completed!`, { permanent: true });

}