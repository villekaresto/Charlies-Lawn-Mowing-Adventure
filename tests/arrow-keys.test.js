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

const keydownSrc = extractHandler(html, "document.addEventListener('keydown', e => {", 'handleKeyDown');
const keyupSrc = extractHandler(html, "document.addEventListener('keyup', e => {", 'handleKeyUp');

const context = { keys: {}, console };
vm.createContext(context);
vm.runInContext(`${keydownSrc}\n${keyupSrc}`, context);

const evt = { key: 'ArrowLeft', preventDefault: () => {} };
context.handleKeyDown(evt);
assert.strictEqual(context.keys.arrowleft, true, 'ArrowLeft keydown should set keys.arrowleft true');

context.handleKeyUp(evt);
assert.strictEqual(context.keys.arrowleft, false, 'ArrowLeft keyup should set keys.arrowleft false');

console.log('Arrow key handlers toggle keys.arrowleft correctly');
