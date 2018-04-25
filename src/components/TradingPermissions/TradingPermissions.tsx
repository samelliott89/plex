import * as React from "react";
import { Toggle } from "../Toggle";
import * as Web3 from "web3";
import * as _ from "lodash";

import Dharma from "@dharmaprotocol/dharma.js";
import { BigNumber } from "bignumber.js";
import { WrapETH } from "../../components/WrapETH/WrapETH";
import {
    TradingPermissionsWrapper,
    TradingPermissionsTitle,
    TokenList,
    AllTokens,
    PopularTokens,
    TokenListTitle,
} from "./styledComponents";
import { TokenEntity } from "../../models";
const promisify = require("tiny-promisify");
import { displayBalance } from "src/utils/webUtils";
import { web3Errors } from "../../common/web3Errors";
import { BLOCKCHAIN_API } from "../../common/constants";
import TokenLabel from "./TokenLabel";

interface Props {
    web3: Web3;
    dharma: Dharma;
    tokens: TokenEntity[];
    className?: string;
    handleSetAllTokensTradingPermission: (tokens: TokenEntity[]) => void;
    handleToggleTokenTradingPermission: (tokenAddress: string, permission: boolean) => void;
    handleSetError: (errorMessage: string) => void;
    handleFaucetRequest: (tokenAddress: string, userAddress: string, dharma: Dharma) => void;
    toggleTokenLoadingSpinner: (tokenAddress: string, loading: boolean) => void;
    agreeToTerms: boolean;
}

interface State {
    collapse: boolean;
}

class TradingPermissions extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            collapse: false,
        };
        this.getTokenAllowance = this.getTokenAllowance.bind(this);
        this.updateProxyAllowanceAsync = this.updateProxyAllowanceAsync.bind(this);
        this.showMore = this.showMore.bind(this);
    }

    async componentDidMount() {
        this.getTokenData(this.props.dharma);
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.dharma !== prevProps.dharma) {
            this.getTokenData(this.props.dharma);
        }
    }

    async getTokenAllowance(tokenAddress: string) {
        const { web3, dharma } = this.props;
        if (!web3 || !dharma) {
            return new BigNumber(-1);
        }

        const accounts = await promisify(web3.eth.getAccounts)();
        // TODO: handle account retrieval error more robustly
        if (!accounts || !accounts[0]) {
            return new BigNumber(-1);
        }

        const ownerAddress = accounts[0];
        const tokenAllowance = await dharma.token.getProxyAllowanceAsync(
            tokenAddress,
            ownerAddress,
        );
        return new BigNumber(tokenAllowance);
    }

    async getTokenBalance(tokenAddress: string) {
        try {
            const { dharma, web3 } = this.props;
            if (!web3) {
                return new BigNumber(-1);
            }

            const accounts = await promisify(web3.eth.getAccounts)();
            // TODO: handle account retrieval error more robustly
            if (!accounts || !accounts[0]) {
                return new BigNumber(-1);
            }

            const ownerAddress = accounts[0];
            const tokenBalance = await dharma.token.getBalanceAsync(tokenAddress, ownerAddress);
            return new BigNumber(tokenBalance);
        } catch (e) {
            return new BigNumber(-1);
            // console.log(e);
        }
    }

    async getTokenData(dharma: Dharma) {
        try {
            const { handleSetAllTokensTradingPermission } = this.props;

            if (!dharma || !handleSetAllTokensTradingPermission) {
                return;
            }

            const tokens = await dharma.token.getSupportedTokens();

            let allTokens: TokenEntity[] = [];

            for (let token of tokens) {
                const address = token.address;

                const tradingPermitted = this.isAllowanceUnlimited(
                    await this.getTokenAllowance(address),
                );

                let balance = await this.getTokenBalance(address);

                allTokens.push({
                    address,
                    tradingPermitted,
                    balance,
                    awaitingTransaction: false,
                    ...token,
                });
            }

            handleSetAllTokensTradingPermission(allTokens);
        } catch (e) {
            this.props.handleSetError("Unable to get token data");
        }
    }

    async updateProxyAllowanceAsync(tradingPermitted: boolean, tokenAddress: string) {
        this.props.toggleTokenLoadingSpinner(tokenAddress, true);

        try {
            this.props.handleSetError("");
            const { tokens, dharma } = this.props;
            if (!dharma) {
                this.props.handleSetError(web3Errors.UNABLE_TO_FIND_CONTRACTS);
                return;
            }

            let selectedToken: TokenEntity | undefined = undefined;
            for (let token of tokens) {
                if (token.address === tokenAddress) {
                    selectedToken = token;
                    break;
                }
            }
            if (selectedToken) {
                let txHash;
                if (tradingPermitted) {
                    txHash = await dharma.token.setProxyAllowanceAsync(
                        selectedToken.address,
                        new BigNumber(0),
                    );
                } else {
                    txHash = await dharma.token.setUnlimitedProxyAllowanceAsync(
                        selectedToken.address,
                    );
                }

                await dharma.blockchain.awaitTransactionMinedAsync(
                    txHash,
                    BLOCKCHAIN_API.POLLING_INTERVAL,
                    BLOCKCHAIN_API.TIMEOUT,
                );

                selectedToken.tradingPermitted = this.isAllowanceUnlimited(
                    await this.getTokenAllowance(selectedToken.address),
                );

                this.props.handleToggleTokenTradingPermission(tokenAddress, !tradingPermitted);
            }

            this.props.toggleTokenLoadingSpinner(tokenAddress, false);
        } catch (e) {
            if (e.message.includes("Insufficient funds")) {
                this.props.handleSetError(
                    "Insufficient ether in account to pay gas for transaction",
                );
            } else if (e.message.includes("User denied transaction signature")) {
                this.props.handleSetError("Wallet has denied transaction.");
            } else {
                this.props.handleSetError(e.message);
            }

            this.props.toggleTokenLoadingSpinner(tokenAddress, false);
            // throw new Error(e);
        }
    }

    isAllowanceUnlimited(tokenAllowance: BigNumber) {
        return tokenAllowance.greaterThanOrEqualTo(
            new BigNumber(2).pow(32).minus(new BigNumber(1)),
        );
    }

    showMore() {
        this.setState({ collapse: !this.state.collapse });
    }

    render() {
        const {
            handleFaucetRequest,
            handleSetError,
            tokens,
            agreeToTerms,
            dharma,
            web3
        } = this.props;

        if (!this.props.tokens || !this.props.tokens.length) {
            return null;
        }

        let tokenItems: JSX.Element[] = [];
        let popularTokens: JSX.Element[] = [];

        const popularTokenSymbols = ["REP", "ZRX", "MKR", "WETH"];
        const sortedTokens = _.sortBy(tokens, "symbol");

        for (let token of sortedTokens) {
            const { address, name, symbol, numDecimals, balance, tradingPermitted } = token;

            const displayableBalance = displayBalance(token.balance, numDecimals.toNumber());

            const disabled = balance.lte(0) || !agreeToTerms;

            const label = (
                <TokenLabel
                    token={token}
                    balance={displayableBalance}
                    web3={web3}
                    dharma={dharma}
                    handleFaucetRequest={handleFaucetRequest}
                    setError={handleSetError}
                />
            );

            tokenItems.push(
                <Toggle
                    name={name}
                    label={label}
                    checked={tradingPermitted}
                    disabled={disabled}
                    onChange={() =>
                        this.updateProxyAllowanceAsync(tradingPermitted, address)
                    }
                    key={token.symbol}
                />,
            );

            if (popularTokenSymbols.indexOf(token.symbol) >= 0) {
                popularTokens.push(
                    <Toggle
                        name={symbol}
                        label={label}
                        checked={tradingPermitted}
                        disabled={disabled}
                        onChange={() =>
                            this.updateProxyAllowanceAsync(tradingPermitted, address)
                        }
                        key={symbol}
                    />
                );
            }
        }

        return (
            <TradingPermissionsWrapper className={this.props.className}>
                <TradingPermissionsTitle>{"Token Permissions "}</TradingPermissionsTitle>
                <PopularTokens className="popular-tokens">
                    <TokenListTitle>Popular Tokens</TokenListTitle>
                    <TokenList>
                        {popularTokens}
                    </TokenList>
                </PopularTokens>
                <AllTokens>
                    <TokenListTitle>All Tokens</TokenListTitle>
                    <TokenList>
                        {tokenItems}
                    </TokenList>
                </AllTokens>
                <WrapETH />
            </TradingPermissionsWrapper>
        );
    }
}

export { TradingPermissions };
