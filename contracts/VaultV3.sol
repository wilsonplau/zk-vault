// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {Verifier} from "./PasswordHashVerifier.sol";

contract VaultV3 {
    uint256 public hash =
        uint256(
            1121645852825515626345503741442177404306361956507933536148868635850297893661
        );

    Verifier public verifier;
    mapping(address => bool) public nullifiers;

    constructor(Verifier _verifier) payable {
        require(msg.value >= 100 ether, "Vault: inadquate prize");
        verifier = _verifier;
    }

    function unlock(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[3] memory _input
    ) external {
        require(!nullifiers[msg.sender], "Vault: already unlocked");
        require(
            verifier.verifyProof(_a, _b, _c, [_input[0], _input[1], hash]),
            "Vault: invalid proof"
        );
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        nullifiers[msg.sender] = true;
        require(success, "Vault: transfer failed");
    }
}
