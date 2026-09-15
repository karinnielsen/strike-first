# Builds game.html: the real game with select.js appended to its script.
# Run from the repo root:  python3 design/dojo-select-compare/build.py
# Then open /design/dojo-select-compare/game.html on the snake server; ?art= switches the art.
# The crest PNGs are read from design/leaderboard-compare/crests/.
import pathlib
here = pathlib.Path(__file__).parent
page = (here.parent.parent / 'index.html').read_text()
mock = (here / 'select.js').read_text()
page = page.replace('</script>', mock + '\n</script>', 1)
# Relative asset paths in the page resolve from the repo root.
page = page.replace('<head>', '<head><base href="/">', 1)
(here / 'game.html').write_text(page)
print('built', here / 'game.html')
