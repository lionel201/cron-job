import {Aptos, AptosConfig, Network} from "@aptos-labs/ts-sdk";
import {networkConfig, NODE_URL} from "../consts";

console.log('NODE_URL',NODE_URL)
const aptosConfig = new AptosConfig({
    network: networkConfig as Network,
    fullnode: NODE_URL,
})

export const aptos = new Aptos(aptosConfig)