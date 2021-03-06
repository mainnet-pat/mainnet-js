import { RegTestWallet, TestNetWallet, Wallet } from "./Wif";
import { bchParam } from "../chain";
import { BalanceResponse } from "../util/balanceObjectFromSatoshi";
import { getNetworkProvider } from "../network/default";
import { Network } from "cashscript";
import { disconnectProviders, initProviders } from "../network";
import { UnitEnum } from "../enum";

describe(`Test creation of wallet from walletId`, () => {
  test("Get a regtest wallet from string id", async () => {
    let w = await RegTestWallet.fromId(
      "wif:regtest:cQAurrWpGpAtvKcGWvTYFpiTickpTUa3YzXkXpbqD342pscjbCxH"
    );
    expect(w.cashaddr!.startsWith("bchreg:")).toBeTruthy();
  });

  test("Get a testnet wallet from string id", async () => {
    let w = await TestNetWallet.fromId(
      "wif:testnet:cPS12C2bpGHtKjS5NXNyWyTGGRMPk7D7pjp5JfgxRKWyFnWoDyZg"
    );
    expect(w.cashaddr!.startsWith("bchtest:")).toBeTruthy();
  });

  test("Get a mainnet wallet from string id", async () => {
    let w = await Wallet.fromId(
      "wif:mainnet:KysvoRyDkxQycBGj49K8oC3minAfoXnVmkcgx6UsZx3g2VvyGCAa"
    );
    expect(w.cashaddr!.startsWith("bitcoincash")).toBeTruthy();
  });

  describe(`Errors from walletId`, () => {
    test("Expect Error passing testnet wallet to mainnet", async () => {
      expect.assertions(1);
      try {
        await TestNetWallet.fromId(
          "wif:testnet:KysvoRyDkxQycBGj49K8oC3minAfoXnVmkcgx6UsZx3g2VvyGCAa"
        );
      } catch (e) {
        expect(e.message).toBe(
          "Testnet type wif KysvoRyDkxQycBGj49K8oC3minAfoXnVmkcgx6UsZx3g2VvyGCAa passed, should start with c"
        );
      }
    });

    test("Expect Error passing mainnet wallet to testnet", async () => {
      expect.assertions(1);
      try {
        await Wallet.fromId(
          "wif:mainnet:cNfsPtqN2bMRS7vH5qd8tR8GMvgXyL5BjnGAKgZ8DYEiCrCCQcP6"
        );
      } catch (e) {
        expect(e.message).toBe(
          "Mainnet type wif cNfsPtqN2bMRS7vH5qd8tR8GMvgXyL5BjnGAKgZ8DYEiCrCCQcP6 passed, should start with L or K"
        );
      }
    });

    test("Expect Error passing hd wallet", async () => {
      expect.assertions(1);
      try {
        await Wallet.fromId(
          "hd:mainnet:cNfsPtqN2bMRS7vH5qd8tR8GMvgXyL5BjnGAKgZ8DYEiCrCCQcP6"
        );
      } catch (e) {
        expect(e.message).toBe(
          "Wallet type hd was passed to single address wallet"
        );
      }
    });

    test("Expect Error passing unknown wallet", async () => {
      expect.assertions(1);
      try {
        await Wallet.fromId(
          "q2k:mainnet:cNfsPtqN2bMRS7vH5qd8tR8GMvgXyL5BjnGAKgZ8DYEiCrCCQcP6"
        );
      } catch (e) {
        expect(e.message).toBe(
          "Wallet type q2k was passed to single address wallet"
        );
      }
    });
  });
});

describe(`Tests named wallet creation`, () => {
  test("Expect a nameless named wallet to error", async () => {
    expect.assertions(1);
    try {
      await Wallet.named("");
    } catch (e) {
      expect(e.message).toBe("Named wallets must have a non-empty name");
    }
  });

  test("Expect force saving over a named wallet to fail", async () => {
    expect.assertions(1);
    try {
      await RegTestWallet.named("duplicate_name", "dup_test");
      await RegTestWallet.named("duplicate_name", "dup_test", true);
    } catch (e) {
      expect(e.message).toBe(
        "A wallet with the name duplicate_name already exists in dup_test"
      );
    }
  });
});

describe(`Mnemonic wallet creation`, () => {
  test("Expect '11x abandon about' to have the correct key, seed and path", async () => {
    let w = await Wallet.fromId(
      "seed:mainnet:abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
    );
    expect(w.cashaddr!).toBe(
      "bitcoincash:qrvcdmgpk73zyfd8pmdl9wnuld36zh9n4gms8s0u59"
    );
    expect(w.privateKeyWif!).toBe(
      "L4p2b9VAf8k5aUahF1JCJUzZkgNEAqLfq8DDdQiyAprQAKSbu8hf"
    );
    expect(w.getSeed().seed).toBe(
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
    );
    expect(w.getSeed().derivationPath).toBe("m/44'/0'/0'/0/0");
    const info = {
      cashaddr: "bitcoincash:qrvcdmgpk73zyfd8pmdl9wnuld36zh9n4gms8s0u59",
      isTestnet: false,
      name: "",
      network: "mainnet",
      privateKey:
        "e284129cc0922579a535bbf4d1a3b25773090d28c909bc0fed73b5e0222cc372",
      privateKeyWif: "L4p2b9VAf8k5aUahF1JCJUzZkgNEAqLfq8DDdQiyAprQAKSbu8hf",
      publicKey:
        "04aaeb52dd7494c361049de67cc680e83ebcbbbdbeb13637d92cd845f70308af5e9370164133294e5fd1679672fe7866c307daf97281a28f66dca7cbb52919824f",
      publicKeyHash:
        "03aaeb52dd7494c361049de67cc680e83ebcbbbdbeb13637d92cd845f70308af5e",

      derivationPath: "m/44'/0'/0'/0/0",
      seed:
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",

      walletDbEntry:
        "seed:mainnet:abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about:m/44'/0'/0'/0/0",
      walletId:
        "seed:mainnet:abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about:m/44'/0'/0'/0/0",
    };
    expect(w.getInfo()).toEqual(info);
  });

  test("Expect '11x abandon about' to have the correct key, seed and path when generated on 145' coin path", async () => {
    let w = await Wallet.fromId(
      "seed:mainnet:abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about:m/44'/145'/0'/0/0"
    );
    expect(w.cashaddr!).toBe(
      "bitcoincash:qqyx49mu0kkn9ftfj6hje6g2wfer34yfnq5tahq3q6"
    );
    expect(w.privateKeyWif!).toBe(
      "KxbEv3FeYig2afQp7QEA9R3gwqdTBFwAJJ6Ma7j1SkmZoxC9bAXZ"
    );
    expect(w.getSeed().seed).toBe(
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
    );
    expect(w.getSeed().derivationPath).toBe("m/44'/145'/0'/0/0");
  });
  test("Expect '11x abandon about' to have the correct key, seed and path from regtest wallet", async () => {
    let w = await RegTestWallet.fromId(
      "seed:regtest:abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
    );
    expect(w.cashaddr!).toBe(
      "bchreg:qrvcdmgpk73zyfd8pmdl9wnuld36zh9n4g974kwcsl"
    );
    expect(w.privateKeyWif!).toBe(
      "cVB244V26CSLjv3xdR7KfoVdNufdqHSMuAMgjqBUfwWQR4WVFsky"
    );
    expect(w.getSeed().seed).toBe(
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
    );
    expect(w.getSeed().derivationPath).toBe("m/44'/0'/0'/0/0");
  });
});

describe(`Watch only Wallets`, () => {
  test("Create a watch only testnet wallet from string id", async () => {
    let w = await TestNetWallet.fromId(
      "watch:testnet:qppr9h7whx9pzucgqukhtlj8lvgvjlgr3g9ggtkq22"
    );
    expect(w.network).toBe("testnet");
    expect(w.networkPrefix).toBe("bchtest");
    expect(w.cashaddr).toBe(
      "bchtest:qppr9h7whx9pzucgqukhtlj8lvgvjlgr3g9ggtkq22"
    );
  });

  test("Create a watch only regtest wallet from string id", async () => {
    let w = await RegTestWallet.fromId(
      "watch:regtest:qql8ypk6y9qksmjj2qp3r5fr3ne35ltkzss902evnt"
    );
    if (!w) {
      throw Error("Could not derive wallet");
    }

    // the balance unit may also be empty
    let unit;
    expect(((await w.getBalance(unit)) as BalanceResponse).sat).toBe(0);
    expect(w.network).toBe("regtest");
    expect(w.networkPrefix).toBe("bchreg");
    expect(w.cashaddr).toBe(
      "bchreg:qql8ypk6y9qksmjj2qp3r5fr3ne35ltkzss902evnt"
    );
  });

  test("Create a watch only mainnet wallet from string id", async () => {
    let w = await Wallet.fromId(
      "watch:mainnet:qp6e6enhpy0fwwu7nkvlr8rgl06ru0c9lywalz8st5"
    );
    expect(w.network).toBe("mainnet");
    expect(w.networkPrefix).toBe("bitcoincash");
    expect(w.cashaddr).toBe(
      "bitcoincash:qp6e6enhpy0fwwu7nkvlr8rgl06ru0c9lywalz8st5"
    );
  });

  test("Should get the regtest wallet balance", async () => {
    // Build Alice's wallet from Wallet Import Format string, send some sats
    if (!process.env.ADDRESS) {
      throw Error("Attempted to pass an empty address");
    } else {
      let alice = await RegTestWallet.watchOnly(process.env.ADDRESS); // insert WIF from #1
      // Build Bob's wallet from a public address, check his balance.
      const aliceBalance = (await alice.getBalance()) as BalanceResponse;
      expect(aliceBalance.bch).toBeGreaterThan(5000);
      expect(await alice.getBalance("sat")).toBeGreaterThan(
        5000 * bchParam.subUnits
      );
    }
  });

  test("Should get the testnet wallet balance", async () => {
    // Build Alice's wallet from Wallet Import Format string, send some sats
    if (!process.env.PRIVATE_WIF) {
      throw Error("Attempted to pass an empty WIF");
    } else {
      let alice = await TestNetWallet.watchOnly(
        process.env.ALICE_TESTNET_ADDRESS
      ); // insert WIF from #1
      // Build Bob's wallet from a public address, check his balance.
      const aliceBalance = (await alice.getBalance()) as BalanceResponse;
      expect(aliceBalance.sat).toBeGreaterThan(2000);
    }
  });
});
describe(`Wallet subscriptions`, () => {
  test("Should wait for transaction", async () => {
    let provider = getNetworkProvider(Network.REGTEST, undefined, true);
    provider.connect();

    const aliceWif = `wif:regtest:${process.env.PRIVATE_WIF!}`;
    const aliceWallet = await RegTestWallet.fromId(aliceWif);
    const bobWallet = await RegTestWallet.newRandom();

    aliceWallet.provider = provider;
    bobWallet.provider = provider;

    setTimeout(
      () =>
        aliceWallet.send([
          {
            cashaddr: bobWallet.cashaddr!,
            value: 1000,
            unit: "satoshis",
          },
        ]),
      1
    );

    let tx = await bobWallet.waitForTransaction();
    expect(tx.hash).not.toBe("");
    await bobWallet.sendMax(aliceWallet.cashaddr!);
    await provider.disconnect();
  });

  test("Should cancel watching balance", async () => {
    initProviders([Network.REGTEST]);
    const aliceWallet = await RegTestWallet.newRandom();

    let cancel = await aliceWallet.watchBalance(() => {});

    await cancel();

    disconnectProviders([Network.REGTEST]);
  });

  test("Should wait for balance", async () => {
    let provider = getNetworkProvider(Network.REGTEST, undefined, true);
    provider.connect();

    const aliceWif = `wif:regtest:${process.env.PRIVATE_WIF!}`;
    const aliceWallet = await RegTestWallet.fromId(aliceWif);
    const bobWallet = await RegTestWallet.newRandom();

    aliceWallet.provider = provider;
    bobWallet.provider = provider;

    aliceWallet.send([
      {
        cashaddr: bobWallet.cashaddr!,
        value: 2000,
        unit: "satoshis",
      },
    ]);

    let balance = await bobWallet.waitForBalance(2000, UnitEnum.SATOSHIS);
    expect(balance).toBeGreaterThanOrEqual(2000);
    await bobWallet.sendMax(aliceWallet.cashaddr!);
    await provider.disconnect();
  });

  // test("Should watch multiple wallets", async () => {
  //   let provider = getNetworkProvider(Network.REGTEST, undefined, true);
  //   provider.connect();
  //   const aliceId = `wif:regtest:${process.env.PRIVATE_WIF!}`;
  //   const alice = await RegTestWallet.fromId(aliceId);
  //   const bob = await RegTestWallet.newRandom();

  //   setTimeout(
  //     () =>
  //       alice.send([
  //         {
  //           cashaddr: bob.cashaddr!,
  //           value: 1000,
  //           unit: "satoshis",
  //         },
  //       ]),
  //     500
  //   );
  //   let bobBalance = await bob.waitForBalance(1000, "sat");
  //   let bobTx = await bob.waitForTransaction();
  //   expect(bobTx.version).toBe(2);
  //   expect(bobBalance).toBe(1000);
  //   await provider.disconnect();
  // });
});
