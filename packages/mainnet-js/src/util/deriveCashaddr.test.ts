import { RegTestWallet, Wallet } from "../wallet/Wif";
import {
  deriveCashaddr,
  deriveTokenaddr,
  isTokenaddr,
  toCashaddr,
  toSlpaddr,
  toTokenaddr,
} from "./deriveCashaddr";

test("simpleledger", async () => {
  let addr = "bitcoincash:qpttdv3qg2usm4nm7talhxhl05mlhms3ystlwcm8h4";
  let slpAddr = "simpleledger:qpttdv3qg2usm4nm7talhxhl05mlhms3ys8y9rw8ft";
  expect(toCashaddr(addr)).toBe(addr);
  expect(toSlpaddr(addr)).toBe(slpAddr);

  expect(toCashaddr(slpAddr)).toBe(addr);
  expect(toSlpaddr(addr)).toBe(slpAddr);

  addr = "bchtest:qpttdv3qg2usm4nm7talhxhl05mlhms3ys0d2lessf";
  slpAddr = "slptest:qpttdv3qg2usm4nm7talhxhl05mlhms3ys5edyr8z5";
  expect(toCashaddr(addr)).toBe(addr);
  expect(toSlpaddr(addr)).toBe(slpAddr);

  expect(toCashaddr(slpAddr)).toBe(addr);
  expect(toSlpaddr(addr)).toBe(slpAddr);

  addr = "bchreg:qpttdv3qg2usm4nm7talhxhl05mlhms3ys43u76rn0";
  slpAddr = "slpreg:qpttdv3qg2usm4nm7talhxhl05mlhms3ysg3x0302x";
  expect(toCashaddr(addr)).toBe(addr);
  expect(toSlpaddr(addr)).toBe(slpAddr);

  expect(toCashaddr(slpAddr)).toBe(addr);
  expect(toSlpaddr(addr)).toBe(slpAddr);
});

test("Should derive cashaddr", async () => {
  const wallet = await Wallet.newRandom();
  expect(deriveCashaddr(wallet.privateKey!, wallet.networkPrefix)).toBe(
    wallet.cashaddr!
  );
  expect(deriveTokenaddr(wallet.privateKey!, wallet.networkPrefix)).toBe(
    wallet.tokenaddr!
  );
  expect(deriveTokenaddr(wallet.publicKey!, wallet.networkPrefix)).toBe(
    wallet.tokenaddr!
  );
  expect(
    deriveTokenaddr(wallet.publicKeyCompressed!, wallet.networkPrefix)
  ).toBe(wallet.tokenaddr!);
  expect(deriveTokenaddr(wallet.publicKeyHash!, wallet.networkPrefix)).toBe(
    wallet.tokenaddr!
  );
});

test("Test address conversion", async () => {
  const wallet = await RegTestWallet.watchOnly(process.env.ADDRESS!);
  expect(toTokenaddr(wallet.cashaddr!)).toBe(wallet.tokenaddr);
  expect(toCashaddr(wallet.tokenaddr!)).toBe(wallet.cashaddr);

  expect(toCashaddr(wallet.tokenaddr!)).toBe(
    "bchreg:qpttdv3qg2usm4nm7talhxhl05mlhms3ys43u76rn0"
  );
  expect(toTokenaddr(wallet.cashaddr!)).toBe(
    "bchreg:zpttdv3qg2usm4nm7talhxhl05mlhms3ysjm0q59vu"
  );

  expect(isTokenaddr(wallet.cashaddr!)).toBe(false);
  expect(isTokenaddr(wallet.tokenaddr!)).toBe(true);
});
