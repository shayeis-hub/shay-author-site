import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
await build({absWorkingDir:fileURLToPath(new URL('../',import.meta.url)),entryPoints:['src/dashboard/dashboard.js'],bundle:true,minify:true,format:'esm',target:['safari15','chrome100'],outfile:'public/dashboard.js'});
