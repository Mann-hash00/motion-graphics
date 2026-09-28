// node stills.js f1 f2 ... -> out/stills/f###.png
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>console.log('console:',m.text()));
await p.goto('file://'+path.resolve(__dirname,'film.html')+'?render');await p.evaluate(()=>window.READY);
fs.mkdirSync(path.join(__dirname,'out/stills'),{recursive:true});
for(const f of process.argv.slice(2)){const t0=Date.now();await p.evaluate(f=>seek(f/30),+f);await p.screenshot({path:path.join(__dirname,`out/stills/f${String(f).padStart(3,'0')}.png`)});console.log(f,Date.now()-t0,'ms');}
if(errs.length)console.log('ERR',errs);await b.close();})();
