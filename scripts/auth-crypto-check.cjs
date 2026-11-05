const assert = require("node:assert/strict");
const { createHash, randomBytes } = require("node:crypto");
const bcrypt = require("bcryptjs");

async function main() {
  const password = "correct horse battery staple";
  const hash = await bcrypt.hash(password, 8);
  assert.match(hash, /^\$2[ab]\$8\$/);
  assert.equal(await bcrypt.compare(password, hash), true);
  assert.equal(await bcrypt.compare("wrong password", hash), false);

  const firstToken = randomBytes(32).toString("base64url");
  const secondToken = randomBytes(32).toString("base64url");
  assert.notEqual(firstToken, secondToken);
  assert.equal(firstToken.length, 43);
  const tokenHash = createHash("sha256").update(firstToken).digest("hex");
  assert.equal(tokenHash.length, 64);
  assert.notEqual(tokenHash, firstToken);
  console.log(
    "Auth crypto checks passed (bcrypt hash/compare and opaque token digest).",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
