"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aptos = void 0;
const ts_sdk_1 = require("@aptos-labs/ts-sdk");
const consts_1 = require("../consts");
console.log('NODE_URL', consts_1.NODE_URL);
const aptosConfig = new ts_sdk_1.AptosConfig({
    network: consts_1.networkConfig,
    fullnode: consts_1.NODE_URL,
});
exports.aptos = new ts_sdk_1.Aptos(aptosConfig);
