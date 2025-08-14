import assert from 'assert';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import vm from 'vm';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const html = await fs.readFile(path.resolve(__dirname, '../index.html'), 'utf8');

function extractWeek(src) {
  const start = src.indexOf('function week(');
  const open = src.indexOf('{', start);
  let depth = 1;
  let i = open + 1;
  while (depth > 0 && i < src.length) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    i++;
  }
  return src.slice(start, i);
}

const weekSrc = extractWeek(html);
const context = { console };
vm.createContext(context);
vm.runInContext(weekSrc, context);

const { week } = context;

// Timestamp within the current week should be true
assert.strictEqual(week(Date.now()), true);

// Timestamp from previous week should be false
const prev = new Date();
prev.setDate(prev.getDate() - 7);
assert.strictEqual(week(prev.getTime()), false);

// Timestamp from upcoming week should be false
const next = new Date();
next.setDate(next.getDate() + 7);
assert.strictEqual(week(next.getTime()), false);

console.log('leaderboard week() tests passed');

