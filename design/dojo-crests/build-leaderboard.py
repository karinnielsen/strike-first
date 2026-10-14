"""Native 18px icons. Run with Python 3 + Pillow; no large-art resampling.

Each character is exactly one pixel. Short rows are centred, not scaled.
SVGs group horizontal pixel runs by colour for inline use without bitmaps.
"""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
PALETTE = {'.': None, 'Y': '#ffff00', 'y': '#7a7a00',
           'W': '#ece6da', 'g': '#7b7480', 'D': '#2a2a30', 'R': '#d3262f'}
ART = {
    'cobrakai': [
        '................',
        '......YYYY......',
        '....yYYYYYYy....',
        '...yYYDYYDYYy...',
        '..yYYYRDDRYYYy..',
        '..YYYyYYYYyYYY..',
        '..YYyYDWWDYyYY..',
        '..YYyYDRRDYyYY..',
        '..yYyyYRRYyyYy..',
        '...yYyYYYYyYy...',
        '....yyYyyYyy....',
        '......YYYY......',
        '......YyyY......',
        '...YYYYYYYYYY...',
        '..YYyyYYYYyyYY..',
        '...yyyyyyyyyy...',
    ],
    'miyagido': [
        '................',
        '......RRRR......',
        '....RRRRRRRR....',
        '..WWWWRRRRWWW...',
        '.WWWWWWRRWWWWW..',
        'WWWWWWWWWWWWWWWW',
        '.WWWWWgRRgWWWWW.',
        'WWWWWgRRRRgWWWWW',
        '.gggRRgRRgRRggg.',
        '..RRRRRggRRRRR..',
        '...RRRRggRRRR...',
        '....RRggRRRR....',
        '.....gggRR......',
        '......gg........',
        '....gggggg......',
        '..gggg..gggg....',
    ],
    'eaglefang': [
        '................',
        '.....WWWWWW.....',
        '...WWWWWWWWWW...',
        '..WWWWWWWWWWWW..',
        '.WWWWWWWWWWWWWW.',
        '..WDDWWWWWWDDW..',
        '.WWYDDWWWWDDYWW.',
        '..WWWDYYYYDWWW..',
        '.WWWWYYYYYYWWWW.',
        '..WWWWYYYYWWWW..',
        '...WWDRYYRDWW...',
        '..WWWWDRRDWWWW..',
        '...WWWDRRDWWW...',
        '....WWDRRDWW....',
        '.....WDWWDW.....',
        '......WWWW......',
    ],
}

def rgba(value):
    return (0, 0, 0, 0) if value is None else (*bytes.fromhex(value[1:]), 255)

manifest = {}
sprites = {}
for name, rows in ART.items():
    assert len(rows) == 16 and all(len(row) == 16 for row in rows), name
    grid = ['.' * 18] + ['.' + row + '.' for row in rows] + ['.' * 18]
    sprite = Image.new('RGBA', (18, 18))
    sprite.putdata([rgba(PALETTE[p]) for row in grid for p in row])
    sprites[name] = sprite
    sprite.save(ROOT / f'{name}-18.png', optimize=True)
    large = sprite.resize((36, 36), Image.Resampling.NEAREST)
    large.save(ROOT / f'{name}-36.png', optimize=True)
    paths = []
    for key, colour in PALETTE.items():
        if colour is None:
            continue
        runs = []
        for y, row in enumerate(grid):
            x = 0
            while x < 18:
                if row[x] != key:
                    x += 1
                    continue
                start = x
                while x < 18 and row[x] == key:
                    x += 1
                runs.append(f'M{start} {y}h{x-start}v1h{start-x}Z')
        if runs:
            paths.append(f'<path fill="{colour}" d="{"".join(runs)}"/>')
    (ROOT / f'{name}-18.svg').write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" shape-rendering="crispEdges">'
        + ''.join(paths) + '</svg>\n')
    # Check the exported files, including every pixel in each 2x block.
    actual = Image.open(ROOT / f'{name}-18.png').convert('RGBA')
    actual2 = Image.open(ROOT / f'{name}-36.png').convert('RGBA')
    assert actual.size == (18, 18) and actual2.size == (36, 36)
    assert set(actual.getdata()) <= {rgba(c) for c in PALETTE.values()}
    assert {p[3] for p in actual.getdata()} == {0, 255}
    assert all(actual2.getpixel((x, y)) == actual.getpixel((x//2, y//2))
               for y in range(36) for x in range(36))
    box = actual.getbbox()
    manifest[name] = {'grid': grid, 'bounds_xyxy': box,
                      'opaque_pixels': sum(p[3] == 255 for p in actual.getdata()),
                      'png18_bytes': (ROOT / f'{name}-18.png').stat().st_size,
                      'svg_bytes': (ROOT / f'{name}-18.svg').stat().st_size}

(ROOT / 'leaderboard-source.json').write_text(json.dumps(
    {'logical_size': 18, 'palette': PALETTE, 'sprites': manifest}, indent=2) + '\n')

# A compact real-size proof first, followed by explicitly labelled diagnostics.
proof = Image.new('RGB', (660, 290), '#09090b')
draw = ImageDraw.Draw(proof)
try:
    font = ImageFont.truetype('DejaVuSansMono.ttf', 12)
except OSError:
    font = ImageFont.load_default(size=12)  # Proof only; sprites are unaffected.
draw.text((16, 12), '18px native / 12px monospace / #09090b', fill='#ece6da', font=font)
for i, (name, sprite) in enumerate(sprites.items()):
    y = 42 + i * 30
    proof.paste(sprite, (44, y), sprite)
    draw.text((16, y+2), str(i+1), fill='#7b7480', font=font)
    draw.text((72, y+2), ['COBRA KAI', 'MIYAGI-DO', 'EAGLE FANG'][i], fill='#ece6da', font=font)
    draw.text((206, y+2), '1,250', fill='#ece6da', font=font)
draw.text((16, 146), '6x inspection (not display size)', fill='#7b7480', font=font)
for i, sprite in enumerate(sprites.values()):
    zoom = sprite.resize((108, 108), Image.Resampling.NEAREST)
    proof.paste(zoom, (16 + i * 126, 172), zoom)
draw.text((310, 12), 'Monochrome / deuteranopia check', fill='#7b7480', font=font)
for i, sprite in enumerate(sprites.values()):
    mono = Image.new('RGBA', (18, 18), '#ece6da')
    mono.putalpha(sprite.getchannel('A'))
    proof.paste(mono, (324, 42 + i*30), mono)
    sim = sprite.copy()
    for y in range(18):
        for x in range(18):
            r, g, b, a = sprite.getpixel((x, y))
            # Machado 2009 full deuteranopia matrix, applied in linear RGB.
            lin = [v/255/12.92 if v/255 <= .04045 else ((v/255+.055)/1.055)**2.4 for v in (r,g,b)]
            rgb = [sum(c*v for c,v in zip(row, lin)) for row in
                   ((.367322,.860646,-.227968),(.280085,.672501,.047413),(-.01182,.04294,.968881))]
            rgb = [max(0,min(1,v)) for v in rgb]
            rgb = [round(255*(12.92*v if v<=.0031308 else 1.055*v**(1/2.4)-.055)) for v in rgb]
            sim.putpixel((x,y), (*rgb,a))
    proof.paste(sim, (368, 42 + i*30), sim)
proof.save(ROOT / 'leaderboard-proof.png')
print(json.dumps({k: {a:b for a,b in v.items() if a!='grid'} for k,v in manifest.items()}, indent=2))
