// External Libraries
import * as React from "react";
import * as Web3 from "web3";
import { ClipLoader } from "react-spinners";
import Dharma from "@dharmaprotocol/dharma.js";

const promisify = require("tiny-promisify");

// Styled Components
import { TokenSymbol, FaucetButton, LoaderContainer, TokenBalance } from "./styledComponents";

// Models
import { TokenEntity } from "../../models";

import { web3Errors } from "../../common/web3Errors";
import { displayBalance } from "../../utils";

interface Props {
    token: TokenEntity;
    web3: Web3;
    dharma: Dharma;
    setError: (errorMessage: string) => void;
    handleFaucetRequest: (tokenAddress: string, userAddress: string, dharma: Dharma) => void;
}

interface State {
    // Network ID is pulled asynchronously for showing/hiding the faucet.
    networkID: null|number;
}

const KOVAN_NETWORK_ID = 42;

export class TokenLabel extends React.Component<Props, State> {
    state = {
        networkID: null,
    };

    async componentDidMount() {
        const networkIdString = await promisify(web3.version.getNetwork)();
        const networkID = parseInt(networkIdString, 10);

        this.setState({ networkID });
    }

    async handleFaucet(tokenAddress: string) {
        const { dharma, web3, setError, handleFaucetRequest } = this.props;

        // Clear any current error message.
        setError("");

        if (!dharma || !web3) {
            setError(web3Errors.UNABLE_TO_FIND_CONTRACTS);
            return;
        }

        const accounts = await promisify(web3.eth.getAccounts)();

        if (!accounts.length) {
            setError(web3Errors.UNABLE_TO_FIND_ACCOUNTS);
            return;
        }

        return handleFaucetRequest(tokenAddress, accounts[0], dharma);
    }

    hasBalance(): boolean {
        return this.props.token.balance.gt(0);
    }

    showFaucet(): boolean {
        const { networkID } = this.state;

        return networkID === KOVAN_NETWORK_ID;
    }

    render() {
        const token = this.props.token;
        const { address, symbol, awaitingTransaction, balance, numDecimals } = token;

        const showFaucet = this.showFaucet();

        return (
            <div>
                <TokenSymbol>{symbol}</TokenSymbol>

                {
                    this.hasBalance()
                        ?
                            <TokenBalance>{displayBalance(balance, numDecimals.toNumber())}</TokenBalance>
                        :
                            showFaucet && (
                                <FaucetButton
                                    onClick={() => this.handleFaucet(address)}
                                    disabled={awaitingTransaction}
                                >
                                    Faucet
                                </FaucetButton>
                            )
                }

                {
                    awaitingTransaction && (
                        <LoaderContainer>
                            <ClipLoader size={12} color={"#1cc1cc"} loading={awaitingTransaction} />
                        </LoaderContainer>
                    )
                }
            </div>
        );
    }
}
