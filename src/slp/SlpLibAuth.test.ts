import {
  authenticationTemplateToCompilerBCH,
  binToHex,
  hexToBin,
  utf8ToBin,
  validateAuthenticationTemplate,
} from "@bitauth/libauth";
import { parseSLP } from "slp-parser";
import { SlpTxoTemplate } from "../slp/SlpLibAuth";

export const bigIntToBinUint64BE = (value) => {
  const uint64Length = 8;
  const bin = new Uint8Array(uint64Length);
  const writeAsLittleEndian = false;
  const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
  // eslint-disable-next-line functional/no-expression-statement
  view.setBigUint64(0, value, writeAsLittleEndian);
  return bin;
};

test("Test SLP genesis txo template", async () => {
  const template = validateAuthenticationTemplate(SlpTxoTemplate);
  if (typeof template === "string") {
    throw new Error("Transaction template error");
  }
  const compiler = await authenticationTemplateToCompilerBCH(template);

  let genesisTxoBytecode = compiler.generateBytecode("genesis_lock", {
    bytecode: {
      g_token_ticker: utf8ToBin("USDT"),
      g_token_name: utf8ToBin("Tether Ltd. US dollar backed tokens"),
      g_token_document_url: utf8ToBin(
        "https://tether.to/wp-content/uploads/2016/06/TetherWhitePaper.pdf"
      ),
      g_token_document_hash: hexToBin(
        "db4451f11eda33950670aaf59e704da90117ff7057283b032cfaec7779313916"
      ),
      g_decimals: Uint8Array.from([8]),
      g_mint_baton_vout: Uint8Array.from([2]),
      g_initial_token_mint_quantity: bigIntToBinUint64BE(
        BigInt(10000000000000000n)
      ),
    },
  });
  if (!genesisTxoBytecode.success) {
    throw new Error(genesisTxoBytecode.toString());
  }

  const hex = binToHex(genesisTxoBytecode.bytecode);
  expect(hex).toBe(
    "6a04534c500001010747454e45534953045553445423546574686572204c74642e20555320646f6c6c6172206261636b656420746f6b656e734168747470733a2f2f7465746865722e746f2f77702d636f6e74656e742f75706c6f6164732f323031362f30362f546574686572576869746550617065722e70646620db4451f11eda33950670aaf59e704da90117ff7057283b032cfaec77793139160108010208002386f26fc10000"
  );

  const obj = parseSLP(Buffer.from(hex, "hex"));
  //console.log(obj);
});

test("Test SLP send txo template", async () => {
  const template = validateAuthenticationTemplate(SlpTxoTemplate);
  if (typeof template === "string") {
    throw new Error("Transaction template error");
  }
  const compiler = await authenticationTemplateToCompilerBCH(template);

  const amounts = [BigInt(1000000n), BigInt(99000000n)];
  let result: Uint8Array = new Uint8Array();
  for (const amnt of amounts) {
    result = new Uint8Array([ ...result, ...Uint8Array.from([8]), ...bigIntToBinUint64BE(amnt*100000000n)]);
  }

  let sendTxoBytecode = compiler.generateBytecode("send_lock", {
    bytecode: {
      s_token_id: hexToBin(
        "550d19eb820e616a54b8a73372c4420b5a0567d8dc00f613b71c5234dc884b35"
      ),
      s_token_output_quantities: result
    },
  });
  if (!sendTxoBytecode.success) {
    throw new Error(sendTxoBytecode.toString());
  }

  const hex = binToHex(sendTxoBytecode.bytecode);
  expect(hex).toBe(
    "6a04534c500001010453454e4420550d19eb820e616a54b8a73372c4420b5a0567d8dc00f613b71c5234dc884b350800005af3107a40000800232bff5f46c000"
  );

  const obj = parseSLP(Buffer.from(hex, "hex"));
});

test("Test SLP mint txo template", async () => {
  const template = validateAuthenticationTemplate(SlpTxoTemplate);
  if (typeof template === "string") {
    throw new Error("Transaction template error");
  }
  const compiler = await authenticationTemplateToCompilerBCH(template);

  let mintTxoBytecode = compiler.generateBytecode("mint_lock", {
    bytecode: {
      m_token_id: hexToBin(
        "550d19eb820e616a54b8a73372c4420b5a0567d8dc00f613b71c5234dc884b35"
      ),
      m_mint_baton_vout: Uint8Array.from([2]),
      m_additional_token_quantity: bigIntToBinUint64BE(
        BigInt(10000000000000000n)
      )
    },
  });
  if (!mintTxoBytecode.success) {
    throw new Error(mintTxoBytecode.errorType);
  }

  const hex = binToHex(mintTxoBytecode.bytecode);
  expect(hex).toBe(
    "6a04534c50000101044d494e5420550d19eb820e616a54b8a73372c4420b5a0567d8dc00f613b71c5234dc884b35010208002386f26fc10000"
  );

  const obj = parseSLP(Buffer.from(hex, "hex"));
});
