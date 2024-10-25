import express, {Express, Request, Response} from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import {claimReward, handleAuto} from "./controllers";
import {CronExpression} from '@nestjs/schedule';
import {Account, Ed25519PrivateKey, InputGenerateTransactionPayloadData} from "@aptos-labs/ts-sdk";
import path from "path";
import fs from "fs";
import {HexString} from "aptos";
import {aptos} from "./aptosConfigs";
import {Wallet} from "./types";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get('/send', async (req: Request, res: Response) => {
  try {
    const filePath = path.resolve('./data', 'wallet.json');
    const wallets: Wallet[] = JSON.parse(fs.readFileSync(filePath) as any) ?? [];
    const mainWallet = '0x03b282aa771af028e250d5fba5dc575f093482c3080224204cecfe403811dde9'
    const privateKey = new Ed25519PrivateKey(mainWallet)
    const sender = Account.fromPrivateKey({privateKey})
    const recipients = [wallets.map((wallet: Wallet) => wallet.address)];

    // Create transactions to send APT to each account
    const transactions: InputGenerateTransactionPayloadData[] = [];

    for (const wallet of wallets) {
      const transaction: InputGenerateTransactionPayloadData = {
        function: "0x1::aptos_account::transfer",
        functionArguments: [wallet.address, 100000000],
      };
      transactions.push(transaction);
    }
    await aptos.transaction.batch.forSingleAccount({sender: sender, data: transactions});
    res.json({message: "Success"});
  } catch (e:any) {
    res.status(400).json({message: 'Error'});
  }
});

app.get('/generate', async (req: Request, res: Response) => {
  await handleAuto()
  // const filePath = path.resolve('./data', 'wallet.json');
  // const wallets = []
  // for (let i = 0; i < 100; i++) {
  //   const account = Account.generate()
  //   const privateKey = (HexString.fromUint8Array(account.privateKey.toUint8Array()).toString())
  //   const wallet = {
  //     privateKey,
  //     address:account.accountAddress.toString()
  //   }
  //   wallets.push(wallet)
  // }
  // fs.writeFile(filePath, JSON.stringify(wallets), (err) => {
  //   if (err) console.log('Error writing file:', err);
  // });
  res.status(200).json({message: 'Generate successfully'});
});

app.listen(port, () => {
  const task = cron.schedule(CronExpression.EVERY_SECOND, () => {
    claimReward()
  }, {
    scheduled: false
  });

  if (process.env["IS_START_JOB"] === 'true') {
    task.start();
  } else {
    task.stop()
  }
  console.log(`[server]: Server is running at http://localhost:${port}`);
});