import assert from 'assert';

function week(ts) {
  const d = new Date(ts), now = new Date();
  const day = now.getDay();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((day + 6) % 7));
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  return d >= monday && d < nextMonday;
}

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
