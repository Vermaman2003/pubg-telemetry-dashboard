// Archive Data Script
// Creates timestamped snapshots of real telemetry data for historical analysis

const fs = require('fs');
const path = require('path');

const REAL_DATA_PATH = path.join(__dirname, '..', 'public', 'real_telemetry.json');
const ARCHIVE_DIR = path.join(__dirname, '..', 'public', 'data', 'archive');
const SNAPSHOTS_MANIFEST = path.join(__dirname, '..', 'public', 'data', 'snapshots.json');

console.log('📦 PUBG Data Archiver\n');

// Ensure archive directory exists
if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    console.log('✅ Created archive directory');
}

// Check if real data exists
if (!fs.existsSync(REAL_DATA_PATH)) {
    console.error('❌ Error: real_telemetry.json not found');
    console.error('   Run fetch-real-data.js first to generate real data');
    process.exit(1);
}

// Load real data
const realData = JSON.parse(fs.readFileSync(REAL_DATA_PATH, 'utf8'));

if (!realData.metadata || !realData.metadata.fetched_at) {
    console.error('❌ Error: Invalid data format (missing metadata)');
    process.exit(1);
}

// Generate filename from fetch date
const fetchDate = new Date(realData.metadata.fetched_at);
const dateStr = fetchDate.toISOString().split('T')[0]; // YYYY-MM-DD
const archiveFilename = `${dateStr}.json`;
const archivePath = path.join(ARCHIVE_DIR, archiveFilename);

// Check if snapshot already exists
if (fs.existsSync(archivePath)) {
    console.log(`⚠️  Snapshot for ${dateStr} already exists`);
    console.log(`   Overwriting: ${archiveFilename}`);
}

// Save snapshot
fs.writeFileSync(archivePath, JSON.stringify(realData, null, 2));
console.log(`✅ Archived snapshot: ${archiveFilename}`);
console.log(`   Matches: ${realData.matches.length}`);
console.log(`   Fetched: ${realData.metadata.fetched_at}\n`);

// Update snapshots manifest
let snapshots = [];

// Load existing manifest if it exists
if (fs.existsSync(SNAPSHOTS_MANIFEST)) {
    try {
        snapshots = JSON.parse(fs.readFileSync(SNAPSHOTS_MANIFEST, 'utf8'));
    } catch (err) {
        console.log('⚠️  Creating new snapshots manifest');
        snapshots = [];
    }
}

// Remove existing entry for this date if present
snapshots = snapshots.filter(s => s.id !== dateStr);

// Add new snapshot entry
snapshots.push({
    id: dateStr,
    label: fetchDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }),
    date: realData.metadata.fetched_at,
    matches: realData.matches.length,
    description: `Snapshot from ${dateStr}`,
    source: realData.metadata.source || 'real'
});

// Sort by date (newest first)
snapshots.sort((a, b) => new Date(b.date) - new Date(a.date));

// Save manifest
fs.writeFileSync(SNAPSHOTS_MANIFEST, JSON.stringify(snapshots, null, 2));
console.log('✅ Updated snapshots manifest');
console.log(`   Total snapshots: ${snapshots.length}\n`);

// List all snapshots
console.log('📅 Available Snapshots:');
snapshots.forEach((snapshot, index) => {
    console.log(`   ${index + 1}. ${snapshot.label} (${snapshot.matches} matches)`);
});

console.log('\n🎉 Archiving complete!');
process.exit(0);
