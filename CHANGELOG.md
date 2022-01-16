# Changelog
All notable changes to this project will be documented in this file.
<br/>The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
<br/>and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
<br/>See also: [The Angular Convention](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines).

## [Unreleased]

### Added
- Apply Damage: right-clic menu on attack roll message shows menu option of *"Apply Damage"* for selected or targeted characters. Does not work for Vehicles, yet.
- 3 new vehicle movement types: hovercraft, flying and naval.
- 1 new vehicle fuel type: nuclear.

### Changed
- Vehicle side armor has been splitted into left & right armor.
- (For translators only) The language JSON file has been flattened for easier readability.

### Fixed
- #39 - a minor bug where ammo was still consumed for NPCs although the option was unchecked.
- #40 - a major bug blocking attacks with grenades that has no damage (e.g. Smoke grenades).
- #41 - a minor bug where encumbrance calculation with weapon settings was wrong.

## [1.5.0] - 2021-08-12
> The game system is now **officially** released.

### Added
- Support for Items' modifiers.
- Support for draggable items in the hotbar.
- Automatic weapon's reliability change according to the result of the pushed roll.
- Automatic roll result tooltip closing after delay (see system's settings to define the delay).
- ItemSheet's height auto resize.

### Fixed
- #13 - A minor bug where too many ammo was counted in the player's encumbrance.
- #32 - A major bug where it was impossible to use items in an unlinked token.
- CSS styles for sheet's tabs.
- CSS styles for selectors.
- CSS styles for tiny MCE text editors.
- YZUR Library updated to v2.1.1

### Removed
- The "unarmed" line in a character/NPC's inventory is removed. Instead, create an "Unarmed" weapon.

## [1.4.0] - 2021-08-03
### Added
- New Actor: **Military Unit**.
- New "Create Ammo" button for equipped weapons.
- New boolean properties (checkboxes) for weapons:
  - Scope (Telescopic Sight), Night Vision (Night Vision Sight), Bayonet, Bipod, Tripod, and Suppressor.
  - Features for vehicles: P, PG, T, C, H, S, FCS, IR, and Tm.
- New property for vehicles: Smoke Discharger.
- New movement and fuel properties for vehicles.
- Possibility to roll attacks with crew-less vehicles.
- Possibility to roll attacks without ammo tracking (new game settings checkboxes).
- New Item modifier for CUF.
- New Status Effect icons for tokens.
- Armor modifier property for custom ammunitions.
- Translation for actor & item types in the create drop-down.
- CSS styles for Journal Entries and Actor/Item's descriptions.

### Changed
- The "grenade" item type becomes "explosive". *(This is mostly a cosmetic change. Use the input field "Type" to specify what type of explosive it is. Eg: Grenade, Mine, Explosive, etc.)*
- YZUR Library updated to v2.1.0

### Fixed
- A bug where the mag capacity of a vehicle's mounted weapon was not displayed.

## [1.3.1] - 2021-07-20
### Fixed
- Hotfix for missing v1.3 migration.

## [1.3.0] - 2021-07-20
### Changed
- Modifiers management on items has changed, for the better.

### Added
- Reliability values (current & max) for Gear items.
- New settings option for default size for non-vehicle tokens.

### Removed
- Default vision for tokens.

### Fixed
- A bug introduced by the previous update that caused the Emcumbrance's max value to display `NaN` on sheets.
- A bug where shooting a weapon was not possible if it had no skill set in its options.

## [1.2.0] - 2021-07-19
### Fixed
- A critical bug breaking random tables when rolling T2K dice on them.
- A bug with the github templates mentioning a "bot" instead of the game system.
- A bug where the dice roller dialog macro would not show properly the attribute and skill scores.
- A typo in a character's gear tab ("cover**s**" instead of "cover").

## [1.1.0] - 2021-07-17
### Changed
- Ammunition choice has been simplified: It is no more required to have the same *"Ammo Identifier"*. Now the Magazine drop-down in the Weapon sheet shows all available magazines in the player's inventory, compatible or not with the weapon. This change also allows weapons to use different kind of ammunition.

### Added
- Default parameters to tokens.
- The `Heal Time` property in an Injury item can be a roll formula. It will be rolled upon creating such injury in a Character actor.
- Wiki infos for the Weapon sheet.

### Fixed
- A bug where a pushed roll would not render if it contained unexpected dice, like d4, d20 and d100.
- A bug where rolled d4, d20 and d100 would not show their icon in the chat.
- A bug where the Foundry would say there was a newer version of the system but you already had the latest version.
- Weapon "unarmed" wrong crit value (was 3 instead of 4).

## [1.0.2] - 2021-07-13
### Fixed
- A bug where it was impossible to use a vehicle's weapon after adding a crew member and then deleting it from the database without removing it from the vehicle.
- Clamped font size values until a better scaling CSS is produced.

## [1.0.1-hotfix] - 2021-07-12
### Fixed
- A bug where it was impossible to add non-physical items to a character, and vice-versa for vehicles.

## [1.0.0-final+FoundryV8] - 2021-07-12

> :warning: **Major Update with Breaking Changes**
> This is a major update from the alpha version. Migration should work fine, but issues may occur.
> Before applying the system update, [backup your world](https://www.youtube.com/watch?v=OmbxMmqNNXU)!
> If the update inadvertedly broke your world, restore your backup and roll back to the [previous version](https://github.com/Stefouch/t2k4e/releases/tag/0.7.3) of the T2K system. Then contact me to solve the issue ([find me on Discord](https://discordapp.com/invite/DDBZUDf) or [open an issue](https://github.com/Stefouch/t2k4e/issues)).

### Breaking Change
- Foundry 0.8.x!
- New Ammunition Management: All ammo values in all weapons will be erased with this update (only the current value, not the max). Now, to choose an ammo for a weapon, you must select a magazine from your inventory with a corresponding ammo type.
- New Critical Injuries Management: The content of the textarea used to write your critical injuries will be erased and replaced by a more user-friendly way for tracking them.

### Changed
- Compatibility with the latest Foundry version (v0.8.8).
- Use of Twilight 2000 4E final core rules:
  - Dice mechanics are updated.
  - Weapons & Vehicles's reliability score becomes a number instead of a letter.
- Rolls now use the Year Zero Universal Roller (YZUR) library.
- Pushed roll messages are now modified in the chat.
- Ammunition management has been revamped (see breaking change above).

### Added
- Dice So Nice configuration for the rolls.
- Crew management for vehicles.
- Components management for vehicles.
- New item: `injury`, for tracking critical injuries.
- Ammo tracking: rolling an attack with ammo dice will consume ammo from your inventory.
- Radiation Attacks rolling.
- More options for the roll dialog.
- Clicking an input field will now select its whole value.
- Editing a number input field in an item sheet with `+`/`-`/`=` will increase/decrease/set the value accordingly.
- Rolls in the chat are more wordy.
- New property for weapon Items: `Armored` (used by weapons mounted on vehicles).
- Migration script.
- [Discussions](https://github.com/Stefouch/t2k4e/discussions).
- Templates for issues reporting and pull requests.

### Fixed
- A bug with broken encumbrance & backpack progress bars (at the bottom of the Gear tab in a character sheet).
- A bug where it was impossible to shoot a weapon from a vehicle.

## [0.7.3-alpha] - 2021-01-19
### Added
- Vehicle Sheet !

## [0.7.2-alpha] - 2021-01-18
### Added
- A tooltip above Hit & Stress capacities to show the applied modifier.

### Changed
- Decreased the font size of the specialties description in the character sheet.

### Fixed
- Critical: textarea fields in character's sheet combat tab were creating infinite spaces after a line break. *(This is a bug caused by Handlebars with textarea inside partials. [Read more here](https://codepen.io/Munvier/post/stranges-white-spaces-with-backbone-handlebars).)*
- Bug: item type not showing in the item sheet.
- Bug: click listener not working properly with the CuF and Unit Morale rolls in the character sheet.
- Bug: style causing the character's specialties description not taking the whole width of the sheet.
- Bug: ugly style for *equipped* and *backpack* checkboxes in an embed item properties.

## [0.7.1-alpha] - 2021-01-17
### Added
- Item equipping and backpack support.
- T2K Banner in `/assets` folder.

### Fixed
- Clickable dice values in the Stats tab.
- Verbose log.
- CSS styles.

## [0.7.0-alpha] - 2021-01-17
- First release