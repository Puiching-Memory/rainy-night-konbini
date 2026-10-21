import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const deps = path.resolve(__dirname, '..', '.deps', 'node_modules');
const { initialize, build } = await import(pathToFileURL(path.join(deps, 'esbuild-wasm', 'lib', 'main.js')).href);

await initialize();

const result = await build({
  absWorkingDir: __dirname,
  entryPoints: [path.join(__dirname, 'src', 'main.js')],
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  target: ['chrome110', 'safari16'],
  nodePaths: [deps],
  minify: true,
  legalComments: 'none',
  logLevel: 'info',
});

const code = result.outputFiles[0].text;
const template = await fs.readFile(path.join(__dirname, 'index.template.html'), 'utf8');
const inlined = template.replace('/*__APP__*/', () => code.replace(/<\/script/gi, '<\\/script'));
await fs.writeFile(path.join(__dirname, 'index.html'), inlined, 'utf8');
console.log(`Built index.html (${(Buffer.byteLength(inlined) / 1024 / 1024).toFixed(2)} MB)`);
