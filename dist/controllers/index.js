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
exports.claimReward = exports.handleAuto = void 0;
const aptosConfigs_1 = require("../aptosConfigs");
const ts_sdk_1 = require("@aptos-labs/ts-sdk");
const consts_1 = require("../consts");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const submitTransactions = (wallet) => {
    const privateKey = new ts_sdk_1.Ed25519PrivateKey(wallet.privateKey);
    const account = ts_sdk_1.Account.fromPrivateKey({ privateKey });
    const payloads = [];
    for (let i = 0; i < 10000; i += 1) {
        const txn = {
            function: `${consts_1.TAPOS_RESOURCE}::tapos_game_2::play`,
            functionArguments: [true],
        };
        payloads.push(txn);
    }
    try {
        aptosConfigs_1.aptos.transaction.batch.forSingleAccount({
            sender: account,
            data: payloads,
        });
        return true;
    }
    catch (e) {
        throw e;
    }
};
const handleAuto = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const filePath = path_1.default.resolve('./data', 'wallet.json');
        const wallets = (_a = JSON.parse(fs_1.default.readFileSync(filePath))) !== null && _a !== void 0 ? _a : [];
        const tasks = [];
        for (const wallet of wallets) {
            tasks.push(submitTransactions(wallet));
            yield Promise.all(tasks);
        }
    }
    catch (e) {
        console.log(e);
    }
});
exports.handleAuto = handleAuto;
const claimReward = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const privateKey = new ts_sdk_1.Ed25519PrivateKey(consts_1.WALLET_REFERRAL);
        const account = ts_sdk_1.Account.fromPrivateKey({ privateKey });
        const payloadClaimable = {
            function: `${consts_1.AMNIS_REFERRAL_ADDRESS}::referral_ss8::claimable`,
            typeArguments: [consts_1.AM_APT_ADDRESS],
            functionArguments: [account.accountAddress],
        };
        const reward = (yield aptosConfigs_1.aptos.view({ payload: payloadClaimable }))[0];
        console.log('reward', reward);
        if (Number(reward) > 0) {
            const payloadClaim = {
                function: `${consts_1.AMNIS_REFERRAL_ADDRESS}::referral_ss8::claim`,
                typeArguments: [consts_1.AM_APT_ADDRESS],
                functionArguments: [reward],
            };
            const rawTxnSimulate = yield aptosConfigs_1.aptos.transaction.build.simple({
                sender: account.accountAddress,
                data: payloadClaim,
            });
            const userTransaction = yield aptosConfigs_1.aptos.transaction.simulate.simple({
                signerPublicKey: account.publicKey,
                transaction: rawTxnSimulate,
                options: { estimateGasUnitPrice: true, estimateMaxGasAmount: true, estimatePrioritizedGasUnitPrice: true },
            });
            const rawTxn = yield aptosConfigs_1.aptos.transaction.build.simple({
                sender: account.accountAddress,
                data: payloadClaim,
                options: {
                    maxGasAmount: parseInt(String(Number(userTransaction[0].gas_used) * 1.2)),
                    gasUnitPrice: Number(userTransaction[0].gas_unit_price),
                },
            });
            const pendingTransaction = yield aptosConfigs_1.aptos.signAndSubmitTransaction({
                signer: account,
                transaction: rawTxn,
            });
            if (pendingTransaction) {
                console.log('SUCCESS');
            }
        }
    }
    catch (e) {
        console.log(e);
    }
});
exports.claimReward = claimReward;
