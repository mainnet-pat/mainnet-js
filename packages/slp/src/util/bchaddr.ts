export {
  toCashAddress,
  toSlpAddress,
  isValidAddress,
  isCashAddress,
  isSlpAddress,
} from "bchaddrjs-slp";

// export {toCashaddr as toCashAddress,
//         toSlpaddr as toSlpAddress} from "mainnet-js";

// import bchaddr from "bchaddrjs-slp";

// export { isValidAddress, isCashAddress, isSlpAddress } from "bchaddrjs-slp";

// export function toCashAddress(address: string) {
//   if (["bchreg", "slpreg"].some(val => address.includes(val))) {
//     return bchaddr.toRegtestAddress(bchaddr.toCashAddress(address));
//   }

//   return bchaddr.toCashAddress(address);
// }

// export function toSlpAddress(address: string) {
//   if (["bchreg", "slpreg"].some(val => address.includes(val))) {
//     return bchaddr.toSlpRegtestAddress(address);
//   }

//   return bchaddr.toSlpAddress(address);
// }
