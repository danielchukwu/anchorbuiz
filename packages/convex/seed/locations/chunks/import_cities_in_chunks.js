const fs = require('fs');
const readline = require('readline');
const { execSync } = require('child_process');
const path = require('path');

const inputFile = path.join(__dirname, 'cities.jsonl');
const chunkSize = 10000;
let lines = [];
let chunkCount = 0;

const rl = readline.createInterface({
  input: fs.createReadStream(inputFile),
  terminal: false
});

rl.on('line', (line) => {
  lines.push(line);
  if (lines.length >= chunkSize) {
    rl.pause();
    saveAndImportChunk();
    rl.resume();
  }
});

rl.on('close', () => {
  if (lines.length > 0) {
    saveAndImportChunk();
  }
  console.log('All chunks imported.');
});

function saveAndImportChunk() {
  const chunksDir = path.join(__dirname, 'chunks');
  if (!fs.existsSync(chunksDir)) {
    fs.mkdirSync(chunksDir, { recursive: true });
  }

  const chunkFile = path.join(chunksDir, `cities_chunk_${chunkCount}.jsonl`);
  fs.writeFileSync(chunkFile, lines.join('\n') + '\n');
  console.log(`Created chunk ${chunkCount} (${lines.length} lines) at ${chunkFile}`);
  
  // Use absolute path for chunkFile in the command to avoid issues
  const relativeChunkPath = path.relative(path.join(__dirname, '..', '..'), chunkFile);
  
  try {
    // For the first chunk, use --replace to clear existing data. 
    // Subsequent chunks should append.
    const replaceFlag = chunkCount === 0 ? '--replace' : '--append';
    console.log(`Importing chunk ${chunkCount}...`);
    execSync(`npx convex import --table cities "${relativeChunkPath}" ${replaceFlag}`, { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..', '..') 
    });
    console.log(`Chunk ${chunkCount} imported successfully.`);
  } catch (err) {
    console.error(`Error importing chunk ${chunkCount}:`, err.message);
  }
  
  lines = [];
  chunkCount++;
}
