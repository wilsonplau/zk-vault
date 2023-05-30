import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { groth16 } from "snarkjs";
import path from "path";

interface ProofInput {
  password: string;
  address: string;
  hash: string;
}

const zkeyPath = path.join(__dirname, "../circuits/password-hash.zkey");
const wasmPath = path.join(__dirname, "../circuits/password-hash.wasm");

describe("VaultV3", () => {
  async function generateProofCalldata(input: ProofInput) {
    const { proof, publicSignals } = await groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );
    const callDataString = await groth16.exportSolidityCallData(
      proof,
      publicSignals
    );
    return JSON.parse("[" + callDataString + "]");
  }

  async function deployVault(etherAmount: string) {
    const [deployer, user] = await ethers.getSigners();

    const Verifier = await ethers.getContractFactory("Verifier");
    const verifier = await Verifier.deploy();
    await verifier.deployed();

    const Vault = await ethers.getContractFactory("VaultV3");
    const vault = await Vault.deploy(verifier.address, {
      value: ethers.utils.parseEther(etherAmount),
    });
    await vault.deployed();

    return { deployer, user, verifier, vault };
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
      const callData = await generateProofCalldata({
        password: "9999",
        address: "0x0000000000000000000000000000000000000000",
        hash: "7898537970610060421230369403623891521254901267565145825118785909981711110169",
      });
      const tx = vault.connect(user).unlock(...callData);
      await expect(tx).to.be.revertedWith("Vault: invalid proof");
    });
    it("should unlock if provided with the correct password", async () => {
      const { vault, user } = await loadFixture(deployVault100);
      const callData = await generateProofCalldata({
        password: "1234",
        address: "0x0000000000000000000000000000000000000000",
        hash: "1121645852825515626345503741442177404306361956507933536148868635850297893661",
      });
      const tx = vault.connect(user).unlock(...callData);
      await expect(tx).to.not.be.revertedWith("Vault: incorrect password");
      await expect(tx).to.changeEtherBalance(
        user,
        ethers.utils.parseEther("100")
      );
    });
  });
});
