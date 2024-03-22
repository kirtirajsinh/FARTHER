// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {FartherToken} from "../src/FartherToken.sol";

contract CounterTest is Test {
    FartherToken public fartherToken;

    function setUp() public {
        fartherToken = new FartherToken(0);
    }
}
