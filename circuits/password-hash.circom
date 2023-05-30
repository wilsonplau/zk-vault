pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template PasswordHash() {
  // Private Inputs
  signal input password;

  // Public Inputs
  signal input address;
  signal input hash;

  // Public Outputs
  signal output nullifier;

  // Hash the password to see if it matches the hash
  component hasher = Poseidon(1);
  hasher.inputs[0] <== password;
  hasher.out === hash;

  // Generate a nullifier to prevent double spends
  component nullifierHasher = Poseidon(2);
  nullifierHasher.inputs[0] <== address;
  nullifierHasher.inputs[1] <== password;

  // Output the nullifier
  nullifier <== nullifierHasher.out;
}

component main{public [address, hash]} = PasswordHash();