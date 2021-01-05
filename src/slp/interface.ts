import BigNumber from 'bignumber.js';
import { UtxoI } from '../interface';
import { BalanceResponse } from '../util/balanceObjectFromSatoshi';

export type SlpDbResponse = {
  t: any[];
  u: any[];
  c: any[];
  g: any[];
  a: any[];
  x: any[];
  s: any[];
};

export type SlpTokenBalance = {
  amount: BigNumber,
  ticker: string,
  name: string,
  tokenId: string
}

export interface SlpUtxoI extends UtxoI {
  amount: BigNumber;
  decimals: number;
  ticker: string;
  tokenId: string;
}
