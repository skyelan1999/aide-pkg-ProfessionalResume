'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');let html=fs.readFileSync(path.join(root,'src/shell.html'),'utf8');
for(const [marker,file] of Object.entries({STYLE:'src/app.css',BRIDGE:'vendor/aide-workbench-client.js',CORE:'src/core.js',VAULT:'src/vault.js',EXPORT:'src/export.js',FILES:'src/files.js',APP:'src/app.js'})){
 const tag='/*'+marker+'*/';if(html.split(tag).length!==2)throw Error('Missing or duplicate marker: '+marker);
 const data=fs.readFileSync(path.join(root,file),'utf8');if(marker!=='STYLE'&&/<\/script/i.test(data))throw Error('Unsafe script terminator');html=html.replace(tag,()=>data);
}
if(Buffer.byteLength(html)>2*1024*1024)throw Error('Workbench HTML exceeds host budget');
fs.writeFileSync(path.join(root,'workbench.html'),html);console.log('Built self-contained workbench: '+Buffer.byteLength(html)+' bytes');
