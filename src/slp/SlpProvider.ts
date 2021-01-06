import { TxI } from "../interface";
import { SlpTokenBalance, SlpUtxoI } from "./interface";
import BigNumber from "bignumber.js";

export type SlpWatchTransactionCallback = (tx: any) => boolean | void;
export type SlpCancelWatchFn = () => void;
export type SlpWatchBalanceCallback = (
  balance: SlpTokenBalance[]
) => boolean | void;

export interface SlpProvider {
  // all utxos, including mint batons
  SlpUtxos(cashaddr: string): Promise<SlpUtxoI[]>;

  // safe-spendable token utxos, without baton
  SlpSpendableUtxos(
    cashaddr: string,
    ticker?: string,
    tokenId?: string
  ): Promise<SlpUtxoI[]>;

  // token mint baton utxos
  SlpBatonUtxos(
    cashaddr: string,
    ticker?: string,
    tokenId?: string
  ): Promise<SlpUtxoI[]>;

  // get all token balances
  SlpAddressTokenBalances(
    cashaddr: string,
    ticker?: string,
    tokenId?: string
  ): Promise<SlpTokenBalance[]>;

  // get all slp transactions of this address
  SlpAddressTransactionHistory(
    cashaddr: string,
    ticker?: string,
    tokenId?: string
  ): Promise<TxI[]>;

  // waits for next slp transaction to appear in mempool, code execution is halted
  SlpWaitForTransaction(
    cashaddr: string,
    ticker?: string,
    tokenId?: string
  ): Promise<any>;

  // waits for a certain slp token balance to be available in this wallet, code execution is halted
  SlpWaitForBalance(
    value: BigNumber.Value,
    cashaddr: string,
    ticker: string,
    tokenId?: string
  ): Promise<SlpTokenBalance>;

  // set's up a callback to be executed each time the token balance of the wallet is changed
  SlpWatchBalance(
    callback: SlpWatchBalanceCallback,
    cashaddr: string,
    ticker?: string,
    tokenId?: string
  ): SlpCancelWatchFn;

  // sets up a callback to be executed each time a new transaction associated with this wallet's address is entering the mempool
  SlpWatchTransactions(
    callback: SlpWatchTransactionCallback,
    cashaddr: string,
    ticker?: string,
    tokenId?: string
  ): SlpCancelWatchFn;
}

export function _convertBalanceBigNumbers(
  balances: SlpTokenBalance[]
): SlpTokenBalance[] {
  balances.forEach((val) => (val.amount = new BigNumber(val.amount)));
  return balances;
}

export function _convertUtxoBigNumbers(utxos: SlpUtxoI[]): SlpUtxoI[] {
  utxos.forEach((val) => (val.amount = new BigNumber(val.amount)));
  return utxos;
}

// export async function SlpUtxos(cashaddr: string): Promise<SlpUtxoI[]> {
//   return _convertUtxoBigNumbers((await SlpDbQuery(SlpAllUtxosTemplate(cashaddr))).g as SlpUtxoI[]);
// }

// export async function SlpBatonUtxos(cashaddr: string, ticker?: string, tokenId?: string): Promise<SlpUtxoI[]> {
//   return _convertUtxoBigNumbers((await SlpDbQuery(SlpBatonUtxosTemplate(cashaddr, ticker, tokenId))).g as SlpUtxoI[]);
// }

// export async function SlpSpendableUtxos(cashaddr: string, ticker?: string, tokenId?: string): Promise<SlpUtxoI[]> {
//   return _convertUtxoBigNumbers((await SlpDbQuery(SlpSpendableUtxosTemplate(cashaddr, ticker, tokenId))).g as SlpUtxoI[]);;
// }

// export async function SlpAddressTokenBalances(cashaddr: string, ticker?: string, tokenId?: string): Promise<SlpTokenBalance[]> {
//   let balances = _convertBalanceBigNumbers((await SlpDbQuery(SlpAddressTokenBalancesTemplate(cashaddr, ticker, tokenId))).g as SlpTokenBalance[]);
//   return balances;
// }

// export async function SlpAddressTransactionHistory(cashaddr: string, ticker?: string, tokenId?: string): Promise<TxI[]> {
//   const response = await SlpDbQuery(SlpAddressTransactionHistoryTemplate(cashaddr, ticker, tokenId));
//   return response.c.concat(response.u) as TxI[];
// }

// export function SlpWatchTransactions(callback: (tx: any) => boolean, cashaddr: string, ticker?: string, tokenId?: string): () => void {
//   const eventSource = SlpSocketEventSource(SlpWaitForTransactionTemplate(cashaddr, ticker, tokenId));
//   const SlpStopWatchingTransactions = () => {
//     eventSource.close();
//   };

//   eventSource.addEventListener('message', (txEvent: MessageEvent) => {
//     const data = JSON.parse(txEvent.data);
//     if (data.data && data.data.length) {
//       if (callback(data.data[0])) {
//         SlpStopWatchingTransactions();
//       }
//     }
//   }, false);

//   return SlpStopWatchingTransactions;
// }

// export async function SlpWaitForTransaction(cashaddr: string, ticker?: string, tokenId?: string): Promise<any> {
//   return new Promise(async (resolve) => {
//     SlpWatchTransactions((data) => {
//       resolve(data);
//       return true;
//     }, cashaddr, ticker, tokenId);
//   });
// }

// export function SlpWatchBalance(callback: (balance: SlpTokenBalance[]) => boolean | void, cashaddr: string, ticker?: string, tokenId?: string): () => void {
//   return SlpWatchTransactions(() => {
//     let stop = false;
//     SlpAddressTokenBalances(cashaddr, ticker, tokenId).then(balance => { stop = !!callback(balance); });
//     return false;
//   }, cashaddr, ticker, tokenId);
// }

// export async function SlpWaitForBalance(value: BigNumber.Value, cashaddr: string, ticker: string, tokenId?: string): Promise<SlpTokenBalance> {
//   return new Promise(resolve =>
//     SlpWatchBalance((balance: SlpTokenBalance[]) => {
//       let bal = balance[0];
//       if (bal.amount.isGreaterThanOrEqualTo(new BigNumber(value))) {
//         resolve(bal);
//         return true;
//       }

//       return false;
//     }, cashaddr, ticker, tokenId)
//   );
// }
