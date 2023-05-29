// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

contract VaultV2 {
    bytes32 passwordHash;

    constructor(bytes32 _passwordHash) payable {
        require(msg.value >= 100 ether, "Vault: inadquate prize");
        passwordHash = _passwordHash;
    }

    function unlock(bytes32 _password) external {
        require(
            keccak256(abi.encodePacked(_password)) == passwordHash,
            "Vault: incorrect password"
        );
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(success, "Vault: transfer failed");
    }
}
