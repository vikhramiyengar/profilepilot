const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = process.cwd();
const webPackage = path.join(root, 'apps', 'web', 'package.json');

if (!fs.existsSync(webPackage)) {
  const bootstrapDirectory = path.join(root, 'bootstrap');
  const parts = fs.readdirSync(bootstrapDirectory)
    .filter((name) => /^part\d+$/.test(name))
    .sort();

  if (parts.length !== 8) {
    throw new Error(`Expected 8 ProfilePilot archive segments, found ${parts.length}.`);
  }

  const encoded = parts
    .map((name) => fs.readFileSync(path.join(bootstrapDirectory, name), 'utf8'))
    .join('');
  const archive = Buffer.from(encoded, 'base64');
  const checksum = crypto.createHash('sha256').update(archive).digest('hex');
  const expected = 'c7d0c65442adc6b51abdd2186855ffd8978a51e30fce437c4eb374514a8d4488';

  if (checksum !== expected) {
    throw new Error(`ProfilePilot source checksum mismatch: ${checksum}`);
  }

  const archivePath = path.join('/tmp', 'profilepilot-source.tgz');
  fs.writeFileSync(archivePath, archive);
  execFileSync('tar', ['-xzf', archivePath, '-C', root], { stdio: 'inherit' });
}

execFileSync(
  'npm',
  ['install', '--prefix', 'apps/web', '--include=dev', '--no-audit', '--no-fund'],
  { stdio: 'inherit' },
);
