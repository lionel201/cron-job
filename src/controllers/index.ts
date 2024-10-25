import {aptos} from "../aptosConfigs";
import {Account, Ed25519PrivateKey, InputGenerateTransactionPayloadData} from "@aptos-labs/ts-sdk";
import {AM_APT_ADDRESS, AMNIS_REFERRAL_ADDRESS, TAPOS_RESOURCE, WALLET_REFERRAL} from "../consts";
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
  } catch (e) {
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

export const claimReward = async () => {
 try {
   const privateKey = new Ed25519PrivateKey(WALLET_REFERRAL)
   const account = Account.fromPrivateKey({privateKey})

   const payloadClaimable: any = {
     function: `${AMNIS_REFERRAL_ADDRESS}::referral_ss8::claimable`,
     typeArguments: [AM_APT_ADDRESS],
     functionArguments: [account.accountAddress],
   }

   const reward = (await aptos.view({ payload:payloadClaimable }))[0];
   console.log('reward',reward)

   if(Number(reward) > 0){
     const payloadClaim: any = {
       function: `${AMNIS_REFERRAL_ADDRESS}::referral_ss8::claim`,
       typeArguments: [AM_APT_ADDRESS],
       functionArguments: [reward],
     }

     const rawTxnSimulate = await aptos.transaction.build.simple({
       sender: account.accountAddress,
       data: payloadClaim,
     })

     const userTransaction = await aptos.transaction.simulate.simple({
       signerPublicKey: account.publicKey,
       transaction: rawTxnSimulate,
       options: {estimateGasUnitPrice: true, estimateMaxGasAmount: true, estimatePrioritizedGasUnitPrice: true},
     })

     const rawTxn = await aptos.transaction.build.simple({
       sender: account.accountAddress,
       data: payloadClaim,
       options: {
         maxGasAmount: parseInt(String(Number(userTransaction[0].gas_used) * 1.2)),
         gasUnitPrice: Number(userTransaction[0].gas_unit_price),
       },
     })
     const pendingTransaction = await aptos.signAndSubmitTransaction({
       signer: account,
       transaction: rawTxn,
     })
     if(pendingTransaction){
       console.log('SUCCESS')
     }
   }


 }catch (e) {
   console.log(e)
 }
}