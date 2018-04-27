const singleLineString = require("single-line-string");

export const web3Errors = {
    UNABLE_TO_FIND_WEB3_PROVIDER: singleLineString`Make sure that you are using a Web3-enabled
    browser (such as Chrome with MetaMask installed).`,

    UNABLE_TO_FIND_ACCOUNTS: singleLineString`
        Unable to find active account on the current Ethereum network
    `,
    UNABLE_TO_FIND_CONTRACTS: singleLineString`
        Unable to find the Dharma smart contracts on the current Ethereum network.
    `,

    UNABLE_TO_CONNECT_TO_NETWORK: singleLineString`Please ensure that you are connecting
        to the appropriate Ethereum network and that your account is unlocked`,
};
