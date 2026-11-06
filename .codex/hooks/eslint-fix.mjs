import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = realpathSync(fileURLToPath(new URL('../..', import.meta.url)));

const stateDir = join(tmpdir(), 'trd-chain-eslint-hooks');

function gitFiles(args) {
  const result = spawnSync('git', args, { cwd: projectRoot, encoding: 'buffer' });
  if (result.status !== 0) throw new Error(result.stderr.toString().trim() || 'Git failed');
  return result.stdout.toString().split('\0').filter(Boolean);
}

function changedFiles() {
  const paths = new Set([
    ...gitFiles(['ls-files', '-m', '-o', '--exclude-standard', '-z']),
    ...gitFiles(['diff', '--cached', '--name-only', '-z']),
  ]);
  return [...paths].map(path => resolve(projectRoot, path)).filter(path => {
    if (!/\.(?:ts|mts|cts|tsx)$/.test(path) || !existsSync(path)) return false;
    const relativePath = relative(projectRoot, realpathSync(path));
    return relativePath !== '..' && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath);
  });
}

function fingerprint(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function handle(event) {
  if (!event.session_id || !event.tool_use_id || event.permission_mode === 'plan') return;
  const key = createHash('sha256').update(`${event.session_id}:${event.tool_use_id}`).digest('hex');
  const path = join(stateDir, `${key}.json`);

  if (event.hook_event_name === 'PreToolUse') {
    mkdirSync(stateDir, { recursive: true });
    const before = Object.fromEntries(changedFiles().map(file => [file, fingerprint(file)]));
    writeFileSync(path, JSON.stringify(before));
    return;
  }
  if (event.hook_event_name !== 'PostToolUse' || !existsSync(path)) return;
  const before = JSON.parse(readFileSync(path, 'utf8'));
  rmSync(path);
  const files = changedFiles().filter(file => before[file] !== fingerprint(file));
  if (files.length === 0) return;

  const eslintPath = resolve(projectRoot, 'node_modules/eslint/bin/eslint.js');
  const result = spawnSync(process.execPath, [eslintPath, '--fix', '--no-warn-ignored', '--', ...files], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    report(result.error?.message ?? (`${result.stdout ?? ''}${result.stderr ?? ''}`.trim() || 'ESLint process failed'));
  }
}

function report(message) {
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: message } }) + '\n',
  );
}

try {
  handle(JSON.parse(readFileSync(0, 'utf8')));
} catch (error) {
  report(`ESLint hook failed: ${error.message}`);
}
