import { Network } from "..";
import {
  disconnectProviders,
  getNetworkProvider,
  initProviders,
} from "../network";
import bchaddr from "bchaddrjs-slp";
import { Wallet } from "../wallet/Wif";
// import { SlpAddressTokenBalances, SlpAddressTransactionHistory, SlpBatonUtxos, SlpUtxos } from "./SlpDbProvider";

// const tokens_by_slp_address = (address, limit = 100, skip = 0) =>
//   SlpDbQuery({
//     v: 3,
//     q: {
//       db: ["g"],
//       aggregate: [
//         {
//           $match: {
//             "graphTxn.outputs.address": address,
//           },
//         },
//         {
//           $unwind: "$graphTxn.outputs",
//         },
//         {
//           $match: {
//             "graphTxn.outputs.status": "UNSPENT",
//             "graphTxn.outputs.address": address,
//           },
//         },
//         {
//           $group: {
//             _id: "$tokenDetails.tokenIdHex",
//             slpAmount: {
//               $sum: "$graphTxn.outputs.slpAmount",
//             },
//           },
//         },
//         {
//           $sort: {
//             slpAmount: -1,
//           },
//         },
//         {
//           $match: {
//             slpAmount: {
//               $gt: 0,
//             },
//           },
//         },
//         {
//           $lookup: {
//             from: "tokens",
//             localField: "_id",
//             foreignField: "tokenDetails.tokenIdHex",
//             as: "token",
//           },
//         },
//       ],
//       sort: {
//         slpAmount: -1,
//       },
//       skip: skip,
//       limit: limit,
//     },
//   });

// test("Should query slpdb", async () => {
//   const tx = async (txid) =>
//     await SlpDbQuery({
//       v: 3,
//       q: {
//         db: ["c", "u"],
//         aggregate: [
//           {
//             $match: {
//               "tx.h": txid,
//             },
//           },
//           {
//             $limit: 1,
//           },
//         ],
//         limit: 1,
//       },
//     });

//   console.log(
//     await tx("00fb60755258260d489c0111db84062046313b8a6fb131bbb223c9f6918391ca")
//   );
// });

// test("Should get address tokens", async () => {
//   console.log(
//     await tokens_by_slp_address(
//       "simpleledger:qqxj7p2jatt8h3tcpadyxw8a2mr7myqk2qh048qrnh"
//     )
//   );
// });

// test("Should get address slp token utxos", async() => {
//   console.log((await SlpDbQuery(SlpAllUnspentUtxos("simpleledger:qpff4t52evfvy5wk35pw32qdnd8y2w482st6rcuumy"))).g as UtxoI[]);
// });

// describe("Slp tests", () => {
//   beforeAll(async () => {
//     await initProviders([Network.MAINNET]);
//   });

//   afterAll(async () => {
//     await disconnectProviders([Network.MAINNET]);
//   });

//   test("Should return only spendable bch utxos", async () => {
//     const provider = getNetworkProvider(Network.MAINNET);

//     let utxos, cashAddr, slpAddr;
//     // const cashaddr = bchaddr.toCashAddress(
//     //   "simpleledger:qpff4t52evfvy5wk35pw32qdnd8y2w482st6rcuumy"
//     // );
//     // let utxos = await provider.getUtxos(cashaddr);
//     // expect(utxos.length).toBe(0);
//     cashAddr = "bitcoincash:qqsxjha225lmnuedy6hzlgpwqn0fd77dfq73p60wwp";
//     utxos = await provider.getUtxos(cashAddr);
//     expect(utxos.length).toBe(30);

//     slpAddr = bchaddr.toSlpAddress(cashAddr);
//     utxos = await SlpUtxos(slpAddr);
//     expect(utxos.length).toBe(0);

//     cashAddr = bchaddr.toCashAddress("simpleledger:qpff4t52evfvy5wk35pw32qdnd8y2w482st6rcuumy");
//     utxos = await provider.getUtxos(cashAddr);
//     expect(utxos.length).toBe(2);

//     slpAddr = bchaddr.toSlpAddress(cashAddr);
//     utxos = await SlpUtxos(slpAddr);
//     expect(utxos.length).toBe(2);
//   });

//   test("Should get balances of all tokens", async () => {
//     console.log(await SlpAddressTokenBalances("simpleledger:qq6a8n2mgm8th70dmrt4ffuwyzts6ggzssq38aqk8g"));
//     console.log(await SlpAddressTokenBalances("simpleledger:qq6a8n2mgm8th70dmrt4ffuwyzts6ggzssq38aqk8g", "COVID-19"))
//   });

//   test("Should get tx history of an address", async () => {
//     console.log(await SlpAddressTransactionHistory("simpleledger:qq6a8n2mgm8th70dmrt4ffuwyzts6ggzssq38aqk8g", "COVID-19"));
//   });

//   test("Genesis", async () => {
//     const tx =
//       "0100000001c55e898df161e0b603296b6616fe74f25a095c727c6841c38543f244b17b8cf5030000006a47304402207aecd93c3a53cf64901ebf453e958bc52cc48588c1c5c4d6019adf7dd2d578b2022079fa2580811ab0b78fc488739366372e22350ec94b82aaf6da23954c2b50eb4a4121037e3de2c36d31d9916082d45fb221d67ef9dc8464739cbc16a613be4e34e3457afeffffff040000000000000000a96a04534c500001010747454e45534953045553445423546574686572204c74642e20555320646f6c6c6172206261636b656420746f6b656e734168747470733a2f2f7465746865722e746f2f77702d636f6e74656e742f75706c6f6164732f323031362f30362f546574686572576869746550617065722e70646620db4451f11eda33950670aaf59e704da90117ff7057283b032cfaec77793139160108010208002386f26fc1000022020000000000001976a9140d2f0552ead67bc5780f5a4338fd56c7ed90165088ac22020000000000001976a9140d2f0552ead67bc5780f5a4338fd56c7ed90165088ac05630200000000001976a9142b1d225b83c9238afff5bfdfa86d568bac9b7cff88ac064c0800";
//     const provider = getNetworkProvider(Network.REGTEST);
//     const result = await provider.sendRawTransaction(tx);
//     console.log(result);
//   });

//   test("Get Slp Batons", async () => {
//     console.log(await SlpBatonUtxos("simpleledger:qz348hgs0800wyscvdqdlrlsmxxhffn4cytjz8ph0s", "ftw"));
//   });
// });
