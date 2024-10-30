"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_cron_1 = __importDefault(require("node-cron"));
const controllers_1 = require("./controllers");
const ts_sdk_1 = require("@aptos-labs/ts-sdk");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const aptosConfigs_1 = require("./aptosConfigs");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
app.get('/send', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const filePath = path_1.default.resolve('./data', 'wallet.json');
        const wallets = (_a = JSON.parse(fs_1.default.readFileSync(filePath))) !== null && _a !== void 0 ? _a : [];
        const mainWallet = '0x03b282aa771af028e250d5fba5dc575f093482c3080224204cecfe403811dde9';
        const privateKey = new ts_sdk_1.Ed25519PrivateKey(mainWallet);
        const sender = ts_sdk_1.Account.fromPrivateKey({ privateKey });
        const recipients = [wallets.map((wallet) => wallet.address)];
        // Create transactions to send APT to each account
        const transactions = [];
        for (const wallet of wallets) {
            const transaction = {
                function: "0x1::aptos_account::transfer",
                functionArguments: [wallet.address, 100000000],
            };
            transactions.push(transaction);
        }
        yield aptosConfigs_1.aptos.transaction.batch.forSingleAccount({ sender: sender, data: transactions });
        res.json({ message: "Success" });
    }
    catch (e) {
        res.status(400).json({ message: 'Error' });
    }
}));
app.get('/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, controllers_1.handleAuto)();
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
    res.status(200).json({ message: 'Generate successfully' });
}));
app.listen(port, () => {
    const task = node_cron_1.default.schedule("*/5 * * * * *" /* CronExpression.EVERY_5_SECONDS */, () => {
        (0, controllers_1.claimReward)();
    }, {
        scheduled: false
    });
    if (process.env["IS_START_JOB"] === 'true') {
        task.start();
    }
    else {
        task.stop();
    }
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
