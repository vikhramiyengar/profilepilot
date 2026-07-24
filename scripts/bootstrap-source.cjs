const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = process.cwd();
const webRoot = path.join(root, 'apps', 'web');
const webPackage = path.join(webRoot, 'package.json');

if (!fs.existsSync(webPackage)) {
  const bootstrapDirectory = path.join(root, 'bootstrap');
  const sourceSegments = [
    'part00',
    'part01',
    'part02',
    'part03',
    'part04',
    'fix05_00',
    'fix05_01',
    'fix05_02',
    'fix05_03',
    'fix05_04',
    'fix05_05',
    'part06',
    'part07',
  ];

  for (const name of sourceSegments) {
    const segmentPath = path.join(bootstrapDirectory, name);
    if (!fs.existsSync(segmentPath)) {
      throw new Error(`Missing ProfilePilot source segment: ${name}`);
    }
  }

  const encoded = sourceSegments
    .map((name) => fs.readFileSync(path.join(bootstrapDirectory, name), 'utf8').trim())
    .join('');
  const archive = Buffer.from(encoded, 'base64');
  const checksum = crypto.createHash('sha256').update(archive).digest('hex');
  const expected = 'c7d0c65442adc6b51abdd2186855ffd8978a51e30fce437c4eb374514a8d4488';

  if (checksum !== expected) {
    throw new Error(`ProfilePilot source checksum mismatch: expected ${expected}, received ${checksum}`);
  }

  const archivePath = path.join('/tmp', 'profilepilot-source.tgz');
  fs.writeFileSync(archivePath, archive);
  execFileSync('tar', ['-xzf', archivePath, '-C', root], { stdio: 'inherit' });
}

// Keep the public site usable before production Supabase credentials are added.
// Explicit Vercel environment variables always take precedence over this file.
const hasSupabaseBrowserCredentials = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const hasExplicitDemoSetting = typeof process.env.NEXT_PUBLIC_DEMO_MODE === 'string';

if (!hasSupabaseBrowserCredentials && !hasExplicitDemoSetting) {
  fs.writeFileSync(
    path.join(webRoot, '.env.local'),
    'NEXT_PUBLIC_DEMO_MODE=true\n',
    'utf8'
  );
  console.log('ProfilePilot: enabled safe demo mode because Supabase browser credentials are not configured.');
}

execFileSync(
  'npm',
  ['install', '--prefix', 'apps/web', '--include=dev', '--no-audit', '--no-fund'],
  { stdio: 'inherit' },
);
