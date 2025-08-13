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

// Build handlers
const clickHandlerSrc = extractHandler(html, "startGameBtn.addEventListener('click',e=>{", 'btnHandler');

const context = {
  startCalls: 0,
  startGame: () => { context.startCalls++; },
  console
};

vm.createContext(context);
vm.runInContext(clickHandlerSrc, context);

// Simulate button click
let defaultPrevented = false;
const clickEvent = { preventDefault: () => { defaultPrevented = true; } };
context.btnHandler(clickEvent);

assert.strictEqual(context.startCalls, 1, 'startGame should be called once');
assert.strictEqual(defaultPrevented, true, 'form submission should be prevented');

console.log('Start button calls startGame once without submitting form');
