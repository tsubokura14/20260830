import bcrypt from "bcrypt";

const password = process.argv[2];
if (!password) {
  console.error("使い方: node scripts/hash-password.mjs <パスワード>");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log(hash);
