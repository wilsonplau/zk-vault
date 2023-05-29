import { ethers } from "hardhat";

async function main() {
  const password = ethers.utils.formatBytes32String("Super secret password");

  const Vault = await ethers.getContractFactory("VaultV1");
  const vault = await Vault.deploy(password, {
    value: ethers.utils.parseEther("100"),
  });
  console.log("Vault deployed to: " + vault.address);

  const onChainPassword = await ethers.provider.getStorageAt(
    vault.address,
    0x0
  );
  const tx = await vault.unlock(onChainPassword);
  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
