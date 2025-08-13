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

// Build submit handler function
const submitHandlerSrc = extractHandler(html, "startForm.addEventListener('submit', e => {", 'submitHandler');

const context = {
  handleStartLevelClick: () => { context.handleCalls++; },
  handleCalls: 0,
  startGame: () => { context.startCalls++; context.handleStartLevelClick(); },
  startCalls: 0,
  console
};

vm.createContext(context);
vm.runInContext(submitHandlerSrc, context);

// Simulate Enter key press in name field via form submit
const evt = { preventDefault: () => {} };
context.submitHandler(evt);

assert.strictEqual(context.startCalls, 1, 'startGame should be called once');
assert.strictEqual(context.handleCalls, 1, 'handleStartLevelClick should be called once');

console.log('Enter key in name field starts game and level automatically');
