const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = process.cwd();
const webRoot = path.join(root, 'apps', 'web');
const webPackage = path.join(webRoot, 'package.json');

function reconstructArchive({ directory, segments, expectedChecksum, outputPath, label }) {
  for (const name of segments) {
    const segmentPath = path.join(directory, name);
    if (!fs.existsSync(segmentPath)) {
      throw new Error(`Missing ${label} segment: ${name}`);
    }
  }

  const encoded = segments
    .map((name) => fs.readFileSync(path.join(directory, name), 'utf8').trim())
    .join('');
  const archive = Buffer.from(encoded, 'base64');
  const checksum = crypto.createHash('sha256').update(archive).digest('hex');

  if (checksum !== expectedChecksum) {
    throw new Error(`${label} checksum mismatch: expected ${expectedChecksum}, received ${checksum}`);
  }

  fs.writeFileSync(outputPath, archive);
  execFileSync('tar', ['-xzf', outputPath, '-C', root], { stdio: 'inherit' });
}

if (!fs.existsSync(webPackage)) {
  reconstructArchive({
    directory: path.join(root, 'bootstrap'),
    segments: [
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
    ],
    expectedChecksum: 'c7d0c65442adc6b51abdd2186855ffd8978a51e30fce437c4eb374514a8d4488',
    outputPath: path.join('/tmp', 'profilepilot-source.tgz'),
    label: 'ProfilePilot source',
  });
}

// Apply the consolidated verified hotfix directly over the complete base source.
// This removes the obsolete dependency on an incomplete legacy feature patch set.
reconstructArchive({
  directory: path.join(root, 'patches'),
  segments: [
    'hotfix_20260725_00',
    'hotfix_20260725_01',
    'hotfix_20260725_02',
    'hotfix_20260725_03',
  ],
  expectedChecksum: '7baca63b51f765a8a9e7d0a29da6c9863052c2f0c4796a2875ee8753f0e162f0',
  outputPath: path.join('/tmp', 'profilepilot-hotfix-20260725.tgz'),
  label: 'ProfilePilot release hotfix',
});

console.log('ProfilePilot: applied verified AI, voice, image studio, appeal and consultation release.');

// Keep the public site usable before production Supabase credentials are added.
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
