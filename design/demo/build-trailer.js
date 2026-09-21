// Builds design/demo/trailer.html: the game with trailer.js appended inside
// its own <script>. The copy is generated, so it isn't committed.
//   node design/demo/build-trailer.js
// Then open http://localhost:8765/design/demo/trailer.html
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..');
const game = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const trailer = fs.readFileSync(path.join(__dirname, 'trailer.js'), 'utf8');
const out = game
  .replace('<head>', '<head>\n<base href="../../">')    // assets resolve from the root
  .replace('</script>', trailer + '\n</script>');
fs.writeFileSync(path.join(__dirname, 'trailer.html'), out);
console.log('wrote design/demo/trailer.html');
