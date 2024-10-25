import {Network} from "@aptos-labs/ts-sdk";

export const networkConfig = process.env.CURRENT_NETWORK
const TESTNET_NODE_URL = 'https://api.testnet.aptoslabs.com/v1'
const MAINNET_NODE_URL = 'https://api.mainnet.aptoslabs.com/v1'

const TAPOS_RESOURCE_ACCOUNT_TESTNET = '0xf9254492a5bb97685bb1789834668f3f8f391336b11c063b74ac6f83c37f6ecf'
const TAPOS_RESOURCE_ACCOUNT_MAINNET = '0x7de3fea83cd5ca0e1def27c3f3803af619882db51f34abf30dd04ad12ee6af31'

export const TAPOS_RESOURCE = networkConfig === Network.TESTNET ? TAPOS_RESOURCE_ACCOUNT_TESTNET : TAPOS_RESOURCE_ACCOUNT_MAINNET
export const NODE_URL = networkConfig === Network.TESTNET ? TESTNET_NODE_URL : MAINNET_NODE_URL

export const WALLET_REFERRAL = ''
export const AMNIS_REFERRAL_ADDRESS = '0x70be3af225de4885c10260ff4a26d2184a4878dedd75cadaa53a406c1c1f8dda'
export const AM_APT_ADDRESS = '0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a::amapt_token::AmnisApt'