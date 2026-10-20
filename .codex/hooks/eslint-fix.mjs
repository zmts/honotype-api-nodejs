import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = realpathSync(fileURLToPath(new URL('../..', import.meta.url)));

function fixPatchedFiles(event) {
  if (event.tool_name !== 'apply_patch' || typeof event.tool_input?.command !== 'string') return;

  const paths = [...event.tool_input.command.matchAll(/^\*\*\* (?:Add File|Update File|Move to): (.+)$/gm)];
  const files = paths
    .map(match => resolve(event.cwd ?? projectRoot, match[1]))
    .filter(path => /\.(?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$/.test(path) && existsSync(path) && statSync(path).isFile())
    .map(path => realpathSync(path))
    .filter(path => {
      const relativePath = relative(projectRoot, path);
      return relativePath !== '..' && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath);
    });
  if (files.length === 0) return;

  const eslintPath = resolve(projectRoot, 'node_modules/eslint/bin/eslint.js');
  const result = spawnSync(process.execPath, [eslintPath, '--fix', '--no-warn-ignored', '--', ...new Set(files)], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
  if (result.status === 0) return;

  report(result.error?.message ?? (`${result.stdout ?? ''}${result.stderr ?? ''}`.trim() || 'ESLint process failed'));
}

function report(message) {
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: message } }) + '\n',
  );
}

try {
  fixPatchedFiles(JSON.parse(readFileSync(0, 'utf8')));
} catch (error) {
  report(`ESLint hook failed: ${error.message}`);
}
