import ActorSheetT2K from '../actorSheet.js';
import { TravelActionsConfig } from './components/travel-actions.js';

export default class ActorSheetT2KParty extends ActorSheetT2K {
  static get defaultOptions() {
    const dragDrop = [...super.defaultOptions.dragDrop];
    dragDrop.push({ dragSelector: '.party-member', dropSelector: '.party-member-list' });
    return mergeObject(super.defaultOptions, {
      classes: ['t2k4e', 'sheet', 'actor', 'character', 'party'],
      template: 'systems/t2k4e/templates/actor/party/party-sheet.hbs',
      width: window.innerWidth * 0.05 + 650,
      height: 830,
      resizable: true,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'main' }],
      dragDrop: dragDrop,
    });
  }

  get actorProperties() {
    return this.actor.data.data;
  }

  getData() {
    const data = super.getData();
    data.partyMembers = {};
    data.travel = {};
    data.travelActions = this.getTravelActions();
    let ownedActorId, assignedActorId, travelAction;
    for (let i = 0; i < (data.data.members || []).length; i++) {
      ownedActorId = data.data.members[i];
      data.partyMembers[ownedActorId] = game.actors.get(ownedActorId).data;
    }
    for (const travelActionKey in data.data.travel) {
      travelAction = data.data.travel[travelActionKey];
      data.travel[travelActionKey] = {};

      if (typeof travelAction === 'object') {
        for (let i = 0; i < travelAction.length; i++) {
          assignedActorId = travelAction[i];
          if (assignedActorId != null) {
            data.travel[travelActionKey][assignedActorId] = game.actors.get(assignedActorId).data;
          }
        }
      }
      else if (travelAction !== '') {
        data.travel[travelActionKey][travelAction] = game.actors.get(travelAction).data;
      }
    }
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.member-delete').click(this.handleRemoveMember.bind(this));
    html.find('.reset').click(event => {
      event.preventDefault();
      this.assignPartyMembersToAction(this.actor.data.data.members, 'other');
      this.render(true);
    });

    let button;
    for (const key in TravelActionsConfig) {
      for (let i = 0; i < TravelActionsConfig[key].buttons.length; i++) {
        button = TravelActionsConfig[key].buttons[i];
        html.find('.' + button.class).click(button.handler.bind(this, this));
      }
    }
  }

  getTravelActions() {
    const travelActions = TravelActionsConfig;
    for (const action of Object.values(travelActions)) {
      action.displayJournalEntry = !!action.journalEntryName && !!game.journal.getName(action.journalEntryName);
    }
    return travelActions;
  }

  async handleRemoveMember(event) {
    event.preventDefault();
    const div = $(event.currentTarget).parents('.party-member');
    const entityId = div.data('entity-id');

    const partyMembers = this.actor.data.data.members;
    partyMembers.splice(partyMembers.indexOf(entityId), 1);

    const updateData = {
      'data.members': partyMembers,
    };

    let travelAction, actionParticipants;
    for (const travelActionKey in this.actor.data.data.travel) {
      travelAction = this.actor.data.data.travel[travelActionKey];
      if (travelAction.indexOf(entityId) < 0) continue;

      if (typeof travelAction === 'object') {
        actionParticipants = [...travelAction];
        actionParticipants.splice(actionParticipants.indexOf(entityId), 1);
        updateData['data.travel.' + travelActionKey] = actionParticipants;
      }
      else {
        updateData['data.travel.' + travelActionKey] = '';
      }
    }

    await this.actor.update(updateData);

    div.slideUp(200, () => this.render(false));
  }

  _onDragStart(event) {
    if (event.currentTarget.dataset.itemId !== undefined) {
      super._onDragStart(event);
      return;
    }

    const entityId = event.currentTarget.dataset.entityId;
    event.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        type: 'Actor',
        action: 'assign',
        id: entityId,
      }),
    );
  }

  async _onDrop(event) {
    super._onDrop(event);

    const draggedItem = JSON.parse(event.dataTransfer.getData('text/plain'));
    if (!draggedItem) return;

    if (draggedItem.type !== 'Actor') return;

    const actor = game.actors.get(draggedItem.id);
    if (actor.data.type !== 'character') return;

    if (draggedItem.action === 'assign') {
      this.handleTravelActionAssignment(event, actor);
    }
    else {
      this.handleAddToParty(actor);
    }
    this.render(true);
  }

  async handleTravelActionAssignment(event, actor) {
    const targetElement = event.toElement ? event.toElement : event.target;
    const actionContainer = targetElement.classList.contains('travel-action')
      ? targetElement
      : targetElement.closest('.travel-action');
    if (actionContainer === null) return; // character was dragged god knows where; just pretend it never happened

    this.assignPartyMembersToAction(actor, actionContainer.dataset.travelAction);
  }

  async assignPartyMembersToAction(partyMembers, travelActionKey) {
    if (!Array.isArray(partyMembers)) partyMembers = [partyMembers];

    let updateData = {},
      updDataKey,
      partyMemberId;
    for (let i = 0; i < partyMembers.length; i++) {
      partyMemberId = typeof partyMembers[i] === 'object' ? partyMembers[i].data._id : partyMembers[i];

      // remove party member from the current assignment
      let travelAction, actionParticipants;
      for (const key in this.actor.data.data.travel) {
        travelAction = this.actor.data.data.travel[key];
        if (travelAction.indexOf(partyMemberId) < 0) continue;

        updDataKey = 'data.travel.' + key;
        if (typeof travelAction === 'object') {
          if (updateData[updDataKey] === undefined) {
            actionParticipants = [...travelAction];
            actionParticipants.splice(actionParticipants.indexOf(partyMemberId), 1);
            updateData[updDataKey] = actionParticipants;
          }
          else {
            updateData[updDataKey].splice(updateData[updDataKey].indexOf(partyMemberId), 1);
          }
        }
        else {
          updateData[updDataKey] = '';
        }
      }

      // add party member to a new assignment
      updDataKey = 'data.travel.' + travelActionKey;
      if (typeof this.actor.data.data.travel[travelActionKey] === 'object') {
        if (updateData[updDataKey] === undefined) {
          actionParticipants = [...this.actor.data.data.travel[travelActionKey]];
          actionParticipants.push(partyMemberId);
          updateData[updDataKey] = actionParticipants;
        }
        else {
          updateData[updDataKey].push(partyMemberId);
        }
      }
      else {
        updateData[updDataKey] = partyMemberId;
        // if someone was already assigned here we must move that character to the "Other" assignment
        if (this.actor.data.data.travel[travelActionKey] !== '') {
          if (updateData['data.travel.other'] === undefined) {
            actionParticipants = [...this.actor.data.data.travel.other];
            actionParticipants.push(this.actor.data.data.travel[travelActionKey]);
            updateData['data.travel.other'] = actionParticipants;
          }
          else {
            updateData['data.travel.other'].push(this.actor.data.data.travel[travelActionKey]);
          }
        }
      }
    }

    await this.actor.update(updateData);
  }

  async handleAddToParty(actor) {
    let partyMembers = this.actor.data.data.members;
    const initialCount = partyMembers.length;
    partyMembers.push(actor.data._id);
    partyMembers = [...new Set(partyMembers)]; // remove duplicate values
    if (initialCount === partyMembers.length) return; // nothing changed

    const travelOther = [...this.actor.data.data.travel.other];
    travelOther.push(actor.data._id);
    await this.actor.update({ 'data.members': partyMembers, 'data.travel.other': travelOther });
  }
}
