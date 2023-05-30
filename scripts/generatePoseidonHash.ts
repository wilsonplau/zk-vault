import { buildPoseidon } from "circomlibjs";

async function main() {
  const poseidon = await buildPoseidon();
  const password = 1234;
  const passwordHash = poseidon.F.toObject(poseidon([BigInt(password)]));
  console.log(passwordHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
