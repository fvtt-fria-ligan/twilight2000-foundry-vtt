/* -------------------------------------------- */
/*  Author: @aMediocreDad                       */
/* -------------------------------------------- */

export default async function displayMessages() {
  const { messages } = await fetch('systems/t2k4e/assets/messages/messages.jsonc')
    .then(resp => resp.text())
    .then(jsonc => JSON.parse(stripJSON(jsonc)));

  messages.forEach(message => {
    handleDisplay(message);
  });
}

function stripJSON(data) {
  return data.replace(/[^:]\/\/(.*)/g, '');
}

function handleDisplay(msg) {
  const { content, title, type } = msg;
  if (!isCurrent(msg)) return;
  if (type === 'prompt') return displayPrompt(title, content);
  if (type === 'chat') return sendToChat(title, content);
}

// This function has been refactored.
function isCurrent(msg) {
  const isDisplayable = !msg.display === 'once' || !hasDisplayed(msg.title);
  const minCore = msg['min-core-version'] ?? '0.0.0';
  const maxCore = msg['max-core-version'] ?? '999.0.0';
  const minSys = msg['min-sys-version'] ?? '0.0.0';
  const maxSys = msg['max-sys-version'] ?? '999.0.0';
  const correctCoreVersion = game.data.version === minCore || game.data.version === maxCore ||
  (
    foundry.utils.isNewerVersion(game.data.version, minCore) &&
    foundry.utils.isNewerVersion(maxCore, game.data.version)
  );
  const correctSysVersion = game.system.data.version === minSys || game.system.data.version === maxSys ||
  (
    foundry.utils.isNewerVersion(game.system.data.version, minSys) &&
    foundry.utils.isNewerVersion(maxSys, game.system.data.version)
  );
  return isDisplayable && correctCoreVersion && correctSysVersion;
}

function hasDisplayed(identifier) {
  const settings = game.settings.get('t2k4e', 'messages');
  if (settings?.includes(identifier)) return true;
  else return false;
}

function displayPrompt(title, content) {
  content = content.replace('{name}', game.user.name);
  return Dialog.prompt({
    title: title,
    content: content,
    label: 'Understood!',
    options: { width: 600 },
    callback: () => setDisplayed(title),
  });
}

function sendToChat(title, content) {
  content = content.replace('{name}', game.user.name);
  setDisplayed(title);
  return ChatMessage.create({
    title: title,
    content: `<div class="t2k4e chat-item">${content}</div>`,
  });
}

async function setDisplayed(identifier) {
  const settings = game.settings.get('t2k4e', 'messages');
  settings.push(identifier);
  await game.settings.set('t2k4e', 'messages', settings.flat());
}