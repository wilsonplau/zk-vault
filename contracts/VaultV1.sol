// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

contract VaultV1 {
    bytes32 password;

    constructor(bytes32 _password) payable {
        require(msg.value >= 100 ether, "Vault: inadquate prize");
        password = _password;
    }

    function unlock(bytes32 _password) external {
        require(password == _password, "Vault: incorrect password");
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(success, "Vault: transfer failed");
    }
}
