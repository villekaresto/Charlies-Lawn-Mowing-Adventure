import assert from 'assert';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import vm from 'vm';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const html = await fs.readFile(path.resolve(__dirname, '../index.html'), 'utf8');

function extractHandler(source, startPattern, name) {
  const start = source.indexOf(startPattern);
  const end = source.indexOf('});', start) + 3;
  const snippet = source.slice(start, end);
  return snippet
    .replace(startPattern, `function ${name}(e){`)
    .replace(/}\);$/, '}');
}

// Build global keydown handler function
const keydownHandlerSrc = extractHandler(html, "addEventListener('keydown',e=>{", 'handler');
// Build playerName keydown handler function
const playerHandlerSrc = extractHandler(html, "playerName.addEventListener('keydown',e=>{", 'playerHandler');

const context = {
  keys: {},
  running: false,
  togglePause: () => {},
  handleStartLevelClick: () => { context.handleCalls++; },
  handleCalls: 0,
  startGame: () => { context.startCalls++; context.landing.style.display = 'none'; },
  startCalls: 0,
  playerName: {},
  landing: { style: { display: 'block' } },
  document: { activeElement: null },
  console
};

vm.createContext(context);
vm.runInContext(keydownHandlerSrc, context);
vm.runInContext(playerHandlerSrc, context);

// Simulate Enter key press in name field
const evt = { key: 'Enter', code: 'Enter', preventDefault: () => {} };
context.document.activeElement = context.playerName;
context.playerHandler(evt); // invokes startGame
context.handler(evt); // global keydown handler

assert.strictEqual(context.startCalls, 1, 'startGame should be called once');
assert.strictEqual(context.handleCalls, 0, 'handleStartLevelClick should not be called');

console.log('Enter key in name field starts game without level intro');
