import fs from 'fs';
import path from 'path';

function findRecentFiles(dir: string, depth = 0) {
  if (depth > 6) return;
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (['proc', 'sys', 'usr', 'lib', 'lib64', 'dev', 'etc', 'var', 'node_modules', '.git', 'run', 'boot', 'tmp'].includes(file)) {
        continue;
      }
      try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          findRecentFiles(filePath, depth + 1);
        } else {
          // files modified in the last 60 minutes
          const ageMinutes = (Date.now() - stat.mtimeMs) / (1000 * 60);
          if (ageMinutes < 60) {
            console.log(`Recent file: ${filePath} (${ageMinutes.toFixed(1)} mins ago, ${(stat.size / 1024).toFixed(1)} KB)`);
          }
        }
      } catch (inner) {}
    }
  } catch (e) {}
}

console.log('Searching for files modified in the last 60 minutes...');
findRecentFiles('/');
console.log('Search finished.');
