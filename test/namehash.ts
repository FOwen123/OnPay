import { namehash, packetToBytes } from 'viem/ens';
import { keccak256, stringToBytes, toHex } from 'viem';
import { id, ethers } from 'ethers';

// console.log(namehash("lisk.eth"));
// console.log(namehash("haowen.lisk.eth"));
console.log(toHex(packetToBytes("haowen.lisk.eth"))); // 0x0668616f77656e046c69736b0365746800

function getSelector(signature: string): `0x${string}` {
    return toHex(keccak256(stringToBytes(signature))).slice(0, 10) as `0x${string}`;
}

const selector = getSelector("addr(bytes32)");
console.log(getSelector("addr(bytes32)")); // ✅ 0x3b3b57de

const selectorEthers = id("addr(bytes32)").slice(0, 10);
console.log(selectorEthers);  // ✅ "0x3b3b57de"

const nameHash = namehash("haowen.lisk.eth");
console.log("namehash 0x7686ca5e4fb0eccaf129fa1ce0269cbe7f497edee8214ff3ffe8f05bd19febe2", nameHash);

const callData = selectorEthers + nameHash.slice(2);
console.log(callData);
console.log(callData as `0x${string}`);


