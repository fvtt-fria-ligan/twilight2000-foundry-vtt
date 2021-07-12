# Changelog
All notable changes to this project will be documented in this file.
<br/>The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
<br/>and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
<br/>See also: [The Angular Convention](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines).

## [1.0.0-final+FoundryV8] - 2021-07-10

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
- Bug: broken encumbrance & backpack progress bars (at the bottom of the Gear tab in a character sheet).
- Bug: impossible to shoot a weapon from a vehicle.

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