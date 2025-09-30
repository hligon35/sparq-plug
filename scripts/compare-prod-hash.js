const b=require('bcryptjs');
const fs=require('fs');
// Read directly from sqlite via shell call capturing output
const { execSync } = require('child_process');
const raw = execSync("sqlite3 prisma/prod.db 'select passwordHash from User limit 1;' ").toString().trim();
console.log('Raw from sqlite:', raw, 'len', raw.length);
try {
  console.log('compareSync', b.compareSync('sparqd2025', raw));
} catch(e){
  console.error('compare error', e.message);
}
