import assert from 'assert';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';

// Resolve directory of this test file
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Mock loadImage: returns a resolved Promise with provided src
function loadImage(src) {
  return Promise.resolve({ src });
}

// Build IMG object mapping asset names to mocked image promises
async function buildIMG() {
  const baseDir = path.resolve(__dirname, '..', 'assets');
  const types = ['obstacles', 'powerups'];
  const img = {};

  for (const type of types) {
    const dir = path.join(baseDir, type);
    const files = await fs.readdir(dir);
    for (const file of files) {
      if (file.endsWith('.svg')) {
        const key = file.replace('.svg', '');
        const relPath = path.join('assets', type, file);
        img[key] = loadImage(relPath);
      }
    }
  }
  return img;
}

const IMG = await buildIMG();
const entries = Object.entries(IMG);
assert.ok(entries.length > 0, 'IMG should contain entries');

// Ensure every mocked image promise resolves
await Promise.all(entries.map(async ([name, promise]) => {
  const img = await promise;
  assert.ok(img && img.src, `${name} should resolve with an object containing src`);
}));

console.log('assets IMG entries resolve');
