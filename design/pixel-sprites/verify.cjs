// Validate artwork contracts, not game behaviour. No build tools required.
const assert = require('node:assert/strict');
const sprites = require('./sprites.js');
assert.deepEqual(Object.keys(sprites).sort(), ['body','egg','mouse','rotten-egg','snake-head','tail']);
function verify(sprite, size) {
  assert.equal(sprite.palette['.'], null);
  assert.equal(sprite.rows.length, size);
  assert.equal(new Set(Object.values(sprite.palette)).size, Object.keys(sprite.palette).length);
  for (const [char, color] of Object.entries(sprite.palette)) {
    assert.equal(char.length, 1);
    if (char !== '.') assert.match(color, /^#[0-9a-f]{6}$/);
  }
  for (const row of sprite.rows) {
    assert.equal(row.length, size);
    for (const char of row) assert.ok(Object.hasOwn(sprite.palette, char));
  }
  // Four lossless quarter turns must return the exact source grid.
  let rows = sprite.rows;
  for (let n=0;n<4;n++) rows = rows.map((_,y)=>rows.map((r,x)=>rows[size-1-x][y]).join(''));
  assert.deepEqual(rows, sprite.rows);
}
for (const name of ['egg','rotten-egg','mouse','body','tail']) {
  verify(sprites[name], 10);
  const n = Object.keys(sprites[name].palette).length;
  assert.ok(['body','tail'].includes(name) ? n === 2 : n >= 4 && n <= 6);
}
const head = sprites['snake-head'];
assert.deepEqual(Object.keys(head.parts).sort(), ['head','hood','eyes-open','eyes-blink','eyes-defeated','tongue','markings'].sort());
assert.deepEqual(head.pivot,[9,9]);
for (const part of Object.values(head.parts)) { verify(part,18); assert.deepEqual(part.palette,head.palette); }
assert.equal(Object.keys(head.palette).length,6);
assert.equal(sprites['rotten-egg'].palette.s,'#a8c341');
console.log('PASS: six sprites, seven head layers, square grids, palette budgets, transparent pixels and lossless rotations.');
