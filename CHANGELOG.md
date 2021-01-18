# Changelog
All notable changes to this project will be documented in this file.
<br/>The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
<br/>and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
<br/>See also: [The Angular Convention](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines).

## [0.7.2-alpha] - 2020-01-18
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

## [0.7.1-alpha] - 2020-01-17
### Added
- Item equipping and backpack support.
- T2K Banner in `/assets` folder.

### Fixed
- Clickable dice values in the Stats tab.
- Verbose log.
- CSS styles.

## [0.7.0-alpha] - 2020-01-17
- First release