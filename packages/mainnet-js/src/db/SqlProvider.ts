import StorageProvider from "./StorageProvider.js";
import { WalletI, FaucetQueueItemI } from "./interface.js";
import { getSslConfig } from "./util.js";
import parseDbUrl from "parse-database-url";
import pg from "pg";
import format from "pg-format";

export default class SqlProvider implements StorageProvider {
  protected db;
  protected config;
  protected info;
  protected formatter;
  protected walletTable: string;
  protected faucetQueueTable: string = "faucet_queue";
  protected isInit = false;

  public constructor(walletTable?: string) {
    this.walletTable = walletTable ? walletTable : "wallet";
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "Named wallets and webhooks require a postgres DATABASE_URL environment variable to be set"
      );
    }
    let dbConfig = parseDbUrl(process.env.DATABASE_URL);
    let ssl = getSslConfig();
    if (ssl) {
      dbConfig.ssl = ssl;
    }
    this.config = dbConfig;

    const Pool = pg.Pool;
    this.db = new Pool(dbConfig);
    this.formatter = format;
  }

  public getConfig() {
    return this.config;
  }

  public async init(): Promise<StorageProvider> {
    if (!this.isInit) {
      this.isInit = true;

      let createWalletTable = this.formatter(
        "CREATE TABLE IF NOT EXISTS %I (id SERIAL, name TEXT PRIMARY KEY, wallet TEXT );",
        this.walletTable
      );
      const resWallet = await this.db.query(createWalletTable);

      let createFaucetQueueTable = this.formatter(
        "CREATE TABLE IF NOT EXISTS %I (" +
          "id SERIAL PRIMARY KEY," +
          "address TEXT," +
          "token TEXT," +
          "value TEXT" +
          ");",
        this.faucetQueueTable
      );
      const resFaucetQueue = await this.db.query(createFaucetQueueTable);

      if (!resWallet || !resFaucetQueue)
        throw new Error("Failed to init SqlProvider");
    }

    return this;
  }

  public async close(): Promise<StorageProvider> {
    await this.db.end();
    return this;
  }

  public getInfo(): string {
    return this.info;
  }

  public async addWallet(name: string, walletId: string): Promise<boolean> {
    let text = this.formatter(
      "INSERT into %I (name,wallet) VALUES ($1, $2);",
      this.walletTable
    );
    return await this.db.query(text, [name, walletId]);
  }

  public async getWallets(): Promise<Array<WalletI>> {
    let text = this.formatter("SELECT * FROM %I;", this.walletTable);
    let result = await this.db.query(text);
    if (result) {
      const WalletArray: WalletI[] = await Promise.all(
        result.rows.map(async (obj: WalletI) => {
          return obj;
        })
      );
      return WalletArray;
    } else {
      return [];
    }
  }

  public async getWallet(name: string): Promise<WalletI | undefined> {
    let text = this.formatter(
      "SELECT * FROM %I WHERE name = $1;",
      this.walletTable
    );
    let result = await this.db.query(text, [name]);
    let w = result.rows[0];
    return w;
  }

  public async updateWallet(name: string, walletId: string): Promise<void> {
    let text = this.formatter(
      "UPDATE %I SET wallet = $1 WHERE name = $2;",
      this.walletTable
    );
    await this.db.query(text, [walletId, name]);
  }

  public async walletExists(name: string): Promise<boolean> {
    return (await this.getWallet(name)) !== undefined;
  }

  public async addFaucetQueueItem(
    address: string,
    tokenId: string,
    value: string
  ): Promise<boolean> {
    let text = this.formatter(
      "INSERT into %I (address,token,value) VALUES ($1, $2, $3);",
      this.faucetQueueTable
    );
    return await this.db.query(text, [address, tokenId, value]);
  }

  public async getFaucetQueue(): Promise<Array<FaucetQueueItemI>> {
    let text = this.formatter("SELECT * FROM %I;", this.faucetQueueTable);
    let result = await this.db.query(text);
    if (result) {
      const FaucetQueueItemArray: FaucetQueueItemI[] = await Promise.all(
        result.rows.map(async (obj: FaucetQueueItemI) => {
          return obj;
        })
      );
      return FaucetQueueItemArray;
    } else {
      return [];
    }
  }

  public async deleteFaucetQueueItems(
    items: Array<FaucetQueueItemI>
  ): Promise<boolean> {
    const ids = items.map((val) => val.id);
    let text = this.formatter(
      "DELETE FROM %I WHERE id IN (%L);",
      this.faucetQueueTable,
      ids
    );
    let result = await this.db.query(text);
    return result;
  }

  public async beginTransaction(): Promise<boolean> {
    return await this.db.query("BEGIN");
  }

  public async commitTransaction(): Promise<boolean> {
    return await this.db.query("COMMIT");
  }

  public async rollbackTransaction(): Promise<boolean> {
    return await this.db.query("ROLLBACK");
  }
}
