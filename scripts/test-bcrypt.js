import bcrypt from 'bcryptjs';

const hash = '$2a$12$3nFIjgr.2JV1zCe4IEwmB.WuuVPNoskzT6ihEMKSEwef4NEiJB/my';
const passwords = ['sparqd2025', 'TestPass123!', 'sparqd2024', 'Sparqd2025'];

(async () => {
  for (const pwd of passwords) {
    const ok = await bcrypt.compare(pwd, hash);
    console.log(pwd, ok);
  }
})();
