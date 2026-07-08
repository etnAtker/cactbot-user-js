import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const sourceRoot = path.resolve('src/raidboss');
const outputRoot = path.resolve('dist/raidboss');

const isTypeScriptSource = (filePath) => filePath.endsWith('.ts') && !filePath.endsWith('.d.ts');

const collectSources = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectSources(fullPath));
      continue;
    }

    if (entry.isFile() && isTypeScriptSource(fullPath))
      files.push(fullPath);
  }

  return files;
};

const transpileFile = async (sourceFile) => {
  const relativePath = path.relative(sourceRoot, sourceFile);
  const outputFile = path.join(outputRoot, relativePath).replace(/\.ts$/, '.js');
  const source = await fs.readFile(sourceFile, 'utf8');
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      sourceMap: false,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: sourceFile,
  });

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, result.outputText);

  if (result.sourceMapText !== undefined)
    await fs.writeFile(`${outputFile}.map`, result.sourceMapText);
};

await fs.rm(outputRoot, { force: true, recursive: true });
await fs.mkdir(outputRoot, { recursive: true });

for (const sourceFile of await collectSources(sourceRoot))
  await transpileFile(sourceFile);

