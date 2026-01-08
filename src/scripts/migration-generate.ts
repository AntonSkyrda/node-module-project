import { runTypeorm } from './typeorm-runner';

function getName(): string {
  const name = process.argv.slice(2)[0];
  if (!name) {
    throw new Error('Usage: npm run migration:generate -- <MigrationName>');
  }

  return name;
}

(() => {
  try {
    const name = getName();
    runTypeorm(['migration:generate', `src/migrations/${name}`]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    console.error(`!!! ${message}`);
    process.exitCode = 1;
  }
})();
