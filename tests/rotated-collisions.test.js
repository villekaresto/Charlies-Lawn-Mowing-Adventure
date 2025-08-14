import assert from 'assert';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import vm from 'vm';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const html = await fs.readFile(path.resolve(__dirname, '../index.html'), 'utf8');

function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}`);
  if (start === -1) throw new Error('Function not found: ' + name);
  let i = source.indexOf('{', start);
  let depth = 1;
  i++;
  for (; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) { i++; break; }
    }
  }
  return source.slice(start, i);
}

let hitSrc = html.slice(html.indexOf('const hit'), html.indexOf('const clamp'));
hitSrc += '\nthis.hit = hit;';
const checkCollisionsSrc = extractFunction(html, 'checkCollisions');

const context = { mower: {}, obs: [], console, setComment: () => {}, gameOver: r => { context.reason = r; } };
vm.createContext(context);
vm.runInContext(`${hitSrc}\n${checkCollisionsSrc}`, context);

// Hit helper with rotation
const a = { x: 0, y: 0, w: 20, h: 20 };
const b = { x: 20, y: 0, w: 20, h: 20 };
assert.strictEqual(context.hit(a, b, 0, Math.PI / 4), true, 'Rotated rectangles should intersect');

const c = { x: 60, y: 0, w: 20, h: 20 };
assert.strictEqual(context.hit(a, c, 0, Math.PI / 4), false, 'Separated rectangles should not intersect');

// checkCollisions uses rotation
context.mower = { x: 0, y: 0, w: 20, h: 20, vx: 1, vy: 1, inv: false };
context.obs = [{ t: 'rock', x: 20, y: 0, w: 20, h: 20, a: true, r: Math.PI / 4 }];
context.reason = null;
context.checkCollisions();
assert.strictEqual(context.reason, 'obstacle', 'Collision with rotated obstacle should trigger gameOver');

console.log('Rotated obstacle collisions detected correctly');
