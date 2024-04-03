/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type { MurkyBase, MurkyBaseInterface } from "../MurkyBase";

const _abi = [
  {
    type: "function",
    name: "getProof",
    inputs: [
      {
        name: "data",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "node",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "getRoot",
    inputs: [
      {
        name: "data",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "hashLeafPairs",
    inputs: [
      {
        name: "left",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "right",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "_hash",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "log2ceil",
    inputs: [
      {
        name: "x",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "log2ceilBitMagic",
    inputs: [
      {
        name: "x",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "verifyProof",
    inputs: [
      {
        name: "root",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "proof",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "valueToProve",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "pure",
  },
] as const;

export class MurkyBase__factory {
  static readonly abi = _abi;
  static createInterface(): MurkyBaseInterface {
    return new Interface(_abi) as MurkyBaseInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): MurkyBase {
    return new Contract(address, _abi, runner) as unknown as MurkyBase;
  }
}
