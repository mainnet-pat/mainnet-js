import {
  Wallet, WalletTypeEnum, createWallet,
} from "mainnet-js";
import { WalletRequestI, WalletResponseI } from "mainnet-js";
import { InstallSlpMixins } from "./Slp";

InstallSlpMixins();

/**
 * Create a new SLP aware wallet
 * @param body A wallet request object
 * @returns A promise to a new wallet object
 */
export async function createSlpWallet(body: WalletRequestI): Promise<Wallet> {
  let wallet = (await createWallet(body)).constructor as any;
  let walletType = body.type ? body.type : "seed";
  let networkType = body.network ? body.network : "mainnet";

  // Named wallets are saved in the database
  if (body.name && body.name.length > 0) {
    wallet = await wallet.slp.named(
      body.name
    );
    if (wallet.network != networkType) {
      throw Error(
        `A wallet already exists with name ${body.name}, but with network ${wallet.network} not ${body.network}, per request`
      );
    }
    if (wallet.walletType != walletType) {
      throw Error(
        `A wallet already exists with name ${body.name}, but with type ${wallet.walletType} not ${body.type}, per request`
      );
    }
    return wallet;
  }
  // This handles unsaved/unnamed wallets
  else {
    wallet = await wallet.slp.newRandom();
    wallet.walletType = walletType as WalletTypeEnum;
    return wallet;
  }
}


/**
 * Create a new SLP aware wallet
 * @param walletRequest A wallet request object
 * @returns A new wallet object
 */
export async function createSlpWalletResponse(
  walletRequest: WalletRequestI
): Promise<WalletResponseI> {
  let wallet = await createSlpWallet(walletRequest);
  if (wallet) {
    return asJsonResponse(wallet);
  } else {
    throw Error("Error creating wallet");
  }
}

/**
 * asJsonResponse return a wallet as json
 * @param wallet A wallet object
 * @returns A json wallet response
 */
function asJsonResponse(wallet: Wallet): WalletResponseI {
  if (wallet.mnemonic) {
    return {
      name: wallet.name,
      cashaddr: wallet.cashaddr as string,
      slpaddr: wallet.slp.slpaddr,
      walletId: wallet.toString(),
      ...wallet.getSeed(),
      network: wallet.network as any,
    };
  } else {
    return {
      name: wallet.name,
      cashaddr: wallet.cashaddr as string,
      slpaddr: wallet.slp.slpaddr,
      walletId: wallet.toString(),
      wif: wallet.privateKeyWif,
      network: wallet.network as any,
    };
  }
}
