// Run: node design/board-sprites/verify.cjs
// Optional rendering check uses @napi-rs/canvas when available; no game dependency.
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=__dirname, data=JSON.parse(fs.readFileSync(path.join(root,'paths.json'),'utf8'));
let canvasModule;try{canvasModule=require('@napi-rs/canvas')}catch{}
let paths=0;const allIds=new Set();
for(const [name,asset] of Object.entries(data.assets)){
 const svg=fs.readFileSync(path.join(root,name+'.svg'),'utf8');
 assert(svg.includes('viewBox="0 0 20 20"'));assert(Buffer.byteLength(svg)<20000);assert(asset.paths.length<12);
 assert(!/<(?:defs|g|style|use|image|text|mask|clipPath|filter|linearGradient|radialGradient)\b/.test(svg));
 assert(!/\b(?:stroke|opacity|transform|width|height)=/.test(svg));
 for(const p of asset.paths){assert(/^#[0-9a-f]{6}$/.test(p.fill));assert(!allIds.has(p.id));allIds.add(p.id);assert(svg.includes(`id="${p.id}"`));assert(svg.includes(`d="${p.d}"`));paths++}
 if(canvasModule){
  const {createCanvas,Path2D}=canvasModule;const c=createCanvas(20,20),ctx=c.getContext('2d');
  for(const p of asset.paths){ctx.fillStyle=p.fill;ctx.fill(new Path2D(p.d))}
  assert(ctx.getImageData(0,0,20,20).data.some((v,i)=>i%4===3&&v>0),name+' rendered empty');
 }
}
assert.equal(data.assets['snake-body'].paths.length,1);assert.equal(data.assets['snake-tail'].paths.length,1);
for(const name of ['hood','head','markings','tongue','eye-left','eye-right'])assert(data.assets['snake-head'].paths.some(p=>p.id.endsWith('-'+name)));
console.log(`${Object.keys(data.assets).length} SVGs, ${paths} paths: structure and manifest checks passed.`);
console.log(canvasModule?'Native Canvas Path2D: all assets parsed and rendered at 20px.':'Native Path2D rendering not checked (optional @napi-rs/canvas unavailable).');
