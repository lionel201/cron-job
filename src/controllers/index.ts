import {aptos} from "../aptosConfigs";
import {Account, Ed25519PrivateKey, InputGenerateTransactionPayloadData} from "@aptos-labs/ts-sdk";
import {TAPOS_RESOURCE} from "../consts";
import {wallets} from "../configs";

export const handleAuto = () => {
  try {
    for (const wallet of wallets) {
      const privateKey = new Ed25519PrivateKey(wallet)
      const account = Account.fromPrivateKey({privateKey})
      const payloads: InputGenerateTransactionPayloadData[] = []
      for (let i = 0; i < 1000; i += 1) {
        const txn: InputGenerateTransactionPayloadData = {
          function: `${TAPOS_RESOURCE}::tapos_game_2::play`,
          functionArguments: [true],
        } as any
        payloads.push(txn)
      }
      aptos.transaction.batch.forSingleAccount({
        sender: account,
        data: payloads,
      })
    }
    console.log('done')
  } catch (e) {
    console.log(e)
  }
}