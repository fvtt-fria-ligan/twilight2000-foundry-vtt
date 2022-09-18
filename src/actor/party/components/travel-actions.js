/* eslint-disable no-unused-vars */
import { CharacterPickerDialog } from './character-picker-dialog.js';
import { Helpers } from './helpers.js';
// import localizeString from '@utils/localize-string.js';

/**
 * Roll skill check to perform a travel action
 * @param {object<Actor>} Character Actor Document used to identify who rolls.
 * @param  {string} rollName Display name for the roll
 */
function rollTravelAction(character, rollName) {
  if (!character && !character.owner) return;
  character.sheet.rollAction(rollName);
}

/**
 * Finds the correct character to roll travel action.
 * @param {string} assignedPartyMemberIds Ids of one or all characters assigned to the task (if multiple).
 * @param {string} rollName Used to identify roll.
 */
function handleTravelAction(assignedPartyMemberIds, rollName) {
  const assignedPartyMembers = Helpers.getOwnedCharacters(assignedPartyMemberIds);

  if (assignedPartyMembers.length === 1) {
    rollTravelAction(assignedPartyMembers[0], rollName);
  }
  else if (assignedPartyMembers.length > 1) {
    CharacterPickerDialog.show(
      game.i18n.localize('FLPS.UI.WHO_ROLLS') + ' ' + game.i18n.localize(rollName),
      assignedPartyMembers,
      function (entityId) {
        rollTravelAction(game.actors.get(entityId), rollName);
      },
    );
  }
}

export const TravelActionsConfig = {
  march: {
    key: 'march',
    journalEntryName: 'Marching',
    name: 'FLPS.TRAVEL.MARCH',
    buttons: [
      {
        name: 'FLPS.TRAVEL_ROLL.FORCED_MARCH',
        class: 'travel-forced-march',
        handler: function (party) {
          handleTravelAction(party.actorProperties.travel.march, 'travel-forced-march');
        },
      },
      {
        name: 'FLPS.TRAVEL_ROLL.MARCH_IN_DARKNESS',
        class: 'travel-march-in-darkness',
        handler: function (party) {
          handleTravelAction(party.actorProperties.travel.march, 'travel-march-in-darkness');
        },
      },
    ],
  },
  drive: {
    key: 'drive',
    journalEntryName: 'Driving',
    name: 'FLPS.TRAVEL.DRIVE',
    buttons: [
      {
        name: 'FLPS.TRAVEL_ROLL.DRIVE',
        class: 'travel-drive',
        handler: function (party) {
          handleTravelAction(party.actorProperties.travel.drive, 'travel-drive');
        },
      },
    ],
  },
  watch: {
    key: 'watch',
    journalEntryName: 'Keeping Watch',
    name: 'FLPS.TRAVEL.WATCH',
    buttons: [
      {
        name: 'FLPS.TRAVEL_ROLL.KEEP_WATCH',
        class: 'travel-keep-watch',
        handler: function (party) {
          handleTravelAction(party.actorProperties.travel.watch, 'travel-keep-watch');
        },
      },
    ],
  },
  rest: {
    key: 'rest',
    journalEntryName: 'Resting',
    name: 'FLPS.TRAVEL.REST',
    buttons: [],
  },
  sleep: {
    key: 'sleep',
    journalEntryName: 'Sleeping',
    name: 'FLPS.TRAVEL.SLEEP',
    buttons: [],
  },
  scrounge: {
    key: 'scrounge',
    journalEntryName: 'Scrounging',
    name: 'FLPS.TRAVEL.SCROUNGE',
    buttons: [
      {
        name: 'FLPS.TRAVEL_ROLL.FIND_SCRAP',
        class: 'travel-find-scrap',
        handler: function (party) {
          handleTravelAction(party.actorProperties.travel.scrounge, 'travel-find-scrap');
        },
      },
    ],
  },
  forage: {
    key: 'forage',
    journalEntryName: 'Foraging',
    name: 'FLPS.TRAVEL.FORAGE',
    buttons: [
      {
        name: 'FLPS.TRAVEL_ROLL.FIND_FOOD',
        class: 'travel-find-food',
        handler: function (party) {
          handleTravelAction(party.actorProperties.travel.forage, 'travel-find-food');
        },
      },
    ],
  },
  hunt: {
    key: 'hunt',
    journalEntryName: 'Hunting',
    name: 'FLPS.TRAVEL.HUNT',
    buttons: [
      {
        name: 'FLPS.TRAVEL_ROLL.FIND_PREY',
        class: 'travel-find-prey',
        handler: function (party) {
          handleTravelAction(party.actorProperties.travel.hunt, 'travel-find-prey');
        },
      },
      {
        name: 'FLPS.TRAVEL_ROLL.RECON_PREY',
        class: 'travel-recon-prey',
        handler: function (party) {
          handleTravelAction(party.actorProperties.travel.hunt, 'travel-recon-prey');
        },
      },
      {
        name: 'FLPS.TRAVEL_ROLL.KILL_PREY',
        class: 'travel-kill-prey',
        handler: function (party) {
          handleTravelAction(party.actorProperties.travel.hunt, 'travel-kill-prey');
        },
      },
    ],
  },
  fish: {
    key: 'fish',
    journalEntryName: 'Fishing',
    name: 'FLPS.TRAVEL.FISH',
    buttons: [
      {
        name: 'FLPS.TRAVEL_ROLL.CATCH_FISH',
        class: 'travel-catch-fish',
        handler: function (party) {
          handleTravelAction(party.actorProperties.travel.fish, 'travel-catch-fish');
        },
      },
    ],
  },
  camp: {
    key: 'camp',
    journalEntryName: 'Making Camp',
    name: 'FLPS.TRAVEL.CAMP',
    buttons: [
      {
        name: 'FLPS.TRAVEL_ROLL.MAKE_CAMP',
        class: 'travel-make-camp',
        handler: function (party) {
          handleTravelAction(party.actorProperties.travel.camp, 'travel-make-camp');
        },
      },
      {
        name: 'FLPS.TRAVEL_ROLL.HIDE_CAMP',
        class: 'travel-hide-camp',
        handler: function (party) {
          handleTravelAction(party.actorProperties.travel.camp, 'travel-hide-camp');
        },
      },
    ],
  },
  cook: {
    key: 'cook',
    journalEntryName: 'Cooking',
    name: 'FLPS.TRAVEL.COOK',
    buttons: [
      {
        name: 'FLPS.TRAVEL_ROLL.COOK_FOOD',
        class: 'travel-cook-food',
        handler: function (party) {
          handleTravelAction(party.actorProperties.travel.cook, 'travel-cook-food');
        },
      },
    ],
  },
  other: {
    key: 'other',
    journalEntryName: '',
    name: 'FLPS.TRAVEL.OTHER',
    buttons: [],
  },
};
