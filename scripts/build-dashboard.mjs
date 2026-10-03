import {build} from 'esbuild';
await build({entryPoints:['src/dashboard/dashboard.js'],bundle:true,minify:true,format:'esm',target:['safari15','chrome100'],outfile:'public/dashboard.js'});
