import { SqlProvider } from "../db/index.js";
import { TxI } from "../interface.js";
import { Webhook, WebhookType, WebhookRecurrence } from "./Webhook.js";
import { WebhookBch } from "./WebhookBch.js";
import { RegisterWebhookParams } from "./interface.js";

export class WebhookSqlProvider extends SqlProvider {
  static WebhookTypeMap = {
    "": WebhookBch,
  };

  protected webhookTable: string = "webhook";

  private static _instance: WebhookSqlProvider;

  static async instance() {
    if (!WebhookSqlProvider._instance) {
      WebhookSqlProvider._instance = new WebhookSqlProvider();
      await WebhookSqlProvider._instance.init();
    }

    return WebhookSqlProvider._instance;
  }

  // regexMatch is used to match against the `type` of the webhook, example: 'slp' would match 'slptransaction:in'
  // if nothing matches, WebhookBch will be instantiated
  static RegisterWebhookType(regexMatch: string, type: any) {
    this.WebhookTypeMap[regexMatch] = type;
  }

  public async init(): Promise<SqlProvider> {
    if (!this.isInit) {
      this.isInit = true;

      let createWebhookTable = this.formatter(
        "CREATE TABLE IF NOT EXISTS %I (" +
          "id SERIAL PRIMARY KEY," +
          "cashaddr TEXT," +
          "type TEXT," +
          "recurrence TEXT," +
          "url TEXT," +
          "status TEXT," +
          "tx_seen JSON," +
          "last_height INTEGER," +
          "token_id TEXT," +
          "expires_at TIMESTAMPTZ" +
          ");",
        this.webhookTable
      );
      const resWebhook = await this.db.query(createWebhookTable);

      if (!resWebhook)
        throw new Error("Failed to init SqlProvider");
    }

    return this;
  }

  public async webhookFromDb(hook: Webhook) {
    // map tokenId field from postgres
    hook.tokenId = (hook as any).token_id;
    delete (hook as any).token_id;

    // put WebhookBch (key "") at the end of the list
    const regexes = Object.keys(WebhookSqlProvider.WebhookTypeMap).sort().reverse();

    for (const regex of regexes) {
      if (hook.type.match(regex)) {
        return new WebhookSqlProvider.WebhookTypeMap[regex](hook);
      }
    }
  }

  public async addWebhook(params: RegisterWebhookParams): Promise<Webhook> {
    // init db if it was not, useful for external api calls
    await this.init();

    params.type = params.type || WebhookType.transactionInOut;
    params.recurrence = params.recurrence || WebhookRecurrence.once;
    const expireTimeout =
      Number(process.env.WEBHOOK_EXPIRE_TIMEOUT_SECONDS) || 86400;
    params.duration_sec = params.duration_sec || expireTimeout;
    params.duration_sec =
      params.duration_sec > expireTimeout ? expireTimeout : params.duration_sec;
    params.tokenId = params.tokenId || "";

    if (params.type.indexOf("slp") === 0 && !params.tokenId) {
      throw new Error("'tokenId' parameter is required for SLP webhooks");
    }

    const expires_at = new Date(
      new Date().getTime() + params.duration_sec * 1000
    );
    let text = this.formatter(
      "INSERT into %I (cashaddr,type,recurrence,url,status,tx_seen,last_height,token_id,expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;",
      this.webhookTable
    );

    const result = await this.db.query(text, [
      params.cashaddr,
      params.type,
      params.recurrence,
      params.url,
      "",
      "[]",
      0,
      params.tokenId,
      expires_at.toISOString(),
    ]);
    const hook = await this.webhookFromDb(result.rows[0]);
    hook.db = this;
    return hook;
  }

  public async getWebhooks(): Promise<Array<Webhook>> {
    let text = this.formatter("SELECT * FROM %I;", this.webhookTable);
    let result = await this.db.query(text);
    if (result) {
      const WebhookArray: Webhook[] = await Promise.all(
        result.rows.map(async (obj: any) => {
          obj = await this.webhookFromDb(obj);
          obj.db = this;
          return obj;
        })
      );
      return WebhookArray;
    } else {
      return [];
    }
  }

  public async getWebhook(id: number): Promise<Webhook | undefined> {
    const text = this.formatter(
      "SELECT * FROM %I WHERE id = $1;",
      this.webhookTable
    );
    const result = await this.db.query(text, [id]);
    let hook = result.rows[0];
    if (hook) {
      hook = this.webhookFromDb(hook);
      hook.db = this;
    }
    return hook;
  }

  public async setWebhookStatus(id: number, status: string): Promise<void> {
    let text = this.formatter(
      "UPDATE %I SET status = $1 WHERE id = $2;",
      this.webhookTable
    );
    await this.db.query(text, [status, id]);
  }

  public async setWebhookSeenTxLastHeight(
    id: number,
    tx_seen: Array<TxI>,
    last_height: number
  ): Promise<void> {
    let text = this.formatter(
      "UPDATE %I SET tx_seen = $1, last_height = $2 WHERE id = $3;",
      this.webhookTable
    );
    await this.db.query(text, [JSON.stringify(tx_seen), last_height, id]);
  }

  public async deleteWebhook(id: number): Promise<void> {
    let text = this.formatter(
      "DELETE FROM %I WHERE id = $1;",
      this.webhookTable
    );
    await this.db.query(text, [id]);
  }

  public async clearWebhooks(): Promise<void> {
    let text = this.formatter("DELETE FROM %I;", this.webhookTable);
    await this.db.query(text);
  }
}
