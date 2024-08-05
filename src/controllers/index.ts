import {aptos} from "../aptosConfigs";
import {Account, Ed25519PrivateKey, InputGenerateTransactionPayloadData} from "@aptos-labs/ts-sdk";
import {TAPOS_RESOURCE} from "../consts";
import fs from "fs";
import path from "path";
import {Wallet} from "../types";

const submitTransactions = (wallet: Wallet) => {
  const privateKey = new Ed25519PrivateKey(wallet.privateKey)
  const account = Account.fromPrivateKey({privateKey})
  const payloads: InputGenerateTransactionPayloadData[] = []
  for (let i = 0; i < 10000; i += 1) {
    const txn: InputGenerateTransactionPayloadData = {
      function: `${TAPOS_RESOURCE}::tapos_game_2::play`,
      functionArguments: [true],
    } as any
    payloads.push(txn)
  }
 try {
   aptos.transaction.batch.forSingleAccount({
     sender: account,
     data: payloads,
   })
   return true
 }catch (e) {
   throw e
 }
}

export const handleAuto = async () => {
  try {
    const filePath = path.resolve('./data', 'wallet.json');
    const wallets: Wallet[] = JSON.parse(fs.readFileSync(filePath) as any) ?? [];
    const tasks = []
    for (const wallet of wallets) {
      tasks.push(submitTransactions(wallet))
      await Promise.all(tasks)
    }
  } catch (e) {
    console.log(e)
  }
}