import { spawnSync } from 'node:child_process';

export function runTypeorm(args: string[]): void {
  const result = spawnSync(
    'npx',
    ['typeorm-ts-node-commonjs', '-d', 'ormconfig.ts', ...args],
    {
      stdio: 'inherit',
    },
  );

  process.exitCode = result.status ?? 1;
}
