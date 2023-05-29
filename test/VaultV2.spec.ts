import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("VaultV2", () => {
  async function deployVault(etherAmount: string) {
    const [deployer, user] = await ethers.getSigners();

    const password = "Super secret password";
    const passwordHash = ethers.utils.keccak256(
      ethers.utils.formatBytes32String(password)
    );

    const Vault = await ethers.getContractFactory("VaultV2");
    const vault = await Vault.deploy(passwordHash, {
      value: ethers.utils.parseEther(etherAmount),
    });

    return { vault, deployer, user };
  }
  const deployVault100 = () => deployVault("100");

  describe("constructor()", () => {
    it("should revert if prize is less than 100 ether", async () => {
      await expect(deployVault("99")).to.be.revertedWith(
        "Vault: inadquate prize"
      );
    });
    it("should not revert if prize is 100 ether or more", async () => {
      await expect(deployVault("100")).to.not.be.revertedWith(
        "Vault: inadquate prize"
      );
    });
  });

  describe("unlock()", () => {
    it("should not unlock if provided with the incorrect password", async () => {
      const { vault, user } = await loadFixture(deployVault100);
      await expect(
        vault
          .connect(user)
          .unlock(ethers.utils.formatBytes32String("Wrong password"))
      ).to.be.revertedWith("Vault: incorrect password");
    });
    it("should unlock if provided with the correct password", async () => {
      const { vault, user } = await loadFixture(deployVault100);
      const tx = vault
        .connect(user)
        .unlock(ethers.utils.formatBytes32String("Super secret password"));
      await expect(tx).to.not.be.revertedWith("Vault: incorrect password");
      await expect(tx).to.changeEtherBalance(
        user,
        ethers.utils.parseEther("100")
      );
    });
  });
});
