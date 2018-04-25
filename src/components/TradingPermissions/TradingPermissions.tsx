import * as React from "react";
import { Toggle } from "../Toggle";
import * as Web3 from "web3";
import * as _ from "lodash";

import Dharma from "@dharmaprotocol/dharma.js";
import { BigNumber } from "bignumber.js";
import { WrapETH } from "../../components/WrapETH/WrapETH";
import {
    LoaderContainer,
    TradingPermissionsWrapper,
    TradingPermissionsTitle,
    TokenSymbol,
    TokenBalance,
    FaucetButton,
    ShowMoreButton,
    Arrow,
} from "./styledComponents";
import { TokenEntity } from "../../models";
const promisify = require("tiny-promisify");
import { Collapse } from "reactstrap";
import { ClipLoader } from "react-spinners";
import { displayBalance } from "src/utils/webUtils";
import { web3Errors } from "../../common/web3Errors";
import { BLOCKCHAIN_API } from "../../common/constants";

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
        this.handleFaucet = this.handleFaucet.bind(this);
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

            const tokenRegistry = await dharma.contracts.loadTokenRegistry();

            const tokens = await dharma.token.getSupportedTokens();

            const tokenSymbols = _.map(tokens, "symbol");

            let allTokens: TokenEntity[] = [];

            for (let tokenSymbol of tokenSymbols) {
                const address = await tokenRegistry.getTokenAddressBySymbol.callAsync(tokenSymbol);
                const tradingPermitted = this.isAllowanceUnlimited(
                    await this.getTokenAllowance(address),
                );
                let balance = await this.getTokenBalance(address);
                // balance = tokenSymbol !== 'REP' ? new BigNumber(0) : balance;
                allTokens.push({
                    address,
                    tokenSymbol: tokenSymbol,
                    tradingPermitted,
                    balance,
                    awaitingTransaction: false,
                });
            }

            handleSetAllTokensTradingPermission(allTokens);
        } catch (e) {
            this.props.handleSetError("Unable to get token data");
            // console.log(e);
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

    async handleFaucet(tokenAddress: string) {
        this.props.handleSetError("");
        const { dharma, web3 } = this.props;
        if (!dharma || !web3) {
            this.props.handleSetError(web3Errors.UNABLE_TO_FIND_CONTRACTS);
            return;
        }

        const accounts = await promisify(web3.eth.getAccounts)();
        if (!accounts.length) {
            this.props.handleSetError(web3Errors.UNABLE_TO_FIND_ACCOUNTS);
            return;
        }

        return this.props.handleFaucetRequest(tokenAddress, accounts[0], dharma);
    }

    showMore() {
        this.setState({ collapse: !this.state.collapse });
    }

    render() {
        if (!this.props.tokens || !this.props.tokens.length) {
            return null;
        }
        const { tokens, agreeToTerms } = this.props;
        let tokenItems: JSX.Element[] = [];
        let tokenItemsMore: JSX.Element[] = [];

        let count: number = 0;
        for (let token of tokens) {
            // The number of decimals associated with this token.
            // TODO: Fetch from contracts.
            const numDecimals = 18;

            const displayableBalance = displayBalance(token.balance, numDecimals);

            const tokenLabel = (
                <div>
                    <TokenSymbol>{token.tokenSymbol}</TokenSymbol>
                    {token.balance.gt(0) ? (
                        <TokenBalance>({displayableBalance})</TokenBalance>
                    ) : (
                        <FaucetButton
                            onClick={(e) => this.handleFaucet(token.address)}
                            disabled={token.awaitingTransaction}
                        >
                            Faucet
                        </FaucetButton>
                    )}
                    {token.awaitingTransaction && (
                        <LoaderContainer>
                            <ClipLoader
                                size={12}
                                color={"#1cc1cc"}
                                loading={token.awaitingTransaction}
                            />
                        </LoaderContainer>
                    )}
                </div>
            );
            if (count < 2) {
                tokenItems.push(
                    <Toggle
                        name={token.tokenSymbol}
                        label={tokenLabel}
                        checked={token.tradingPermitted}
                        disabled={token.balance.lte(0) || !agreeToTerms ? true : false}
                        onChange={() =>
                            this.updateProxyAllowanceAsync(token.tradingPermitted, token.address)
                        }
                        key={token.tokenSymbol}
                    />,
                );
            } else {
                tokenItemsMore.push(
                    <Toggle
                        name={token.tokenSymbol}
                        label={tokenLabel}
                        checked={token.tradingPermitted}
                        disabled={token.balance.lte(0) || !agreeToTerms ? true : false}
                        onChange={() =>
                            this.updateProxyAllowanceAsync(token.tradingPermitted, token.address)
                        }
                        key={token.tokenSymbol}
                    />,
                );
            }
            count++;
        }

        return (
            <TradingPermissionsWrapper className={this.props.className}>
                <TradingPermissionsTitle>{"Token Permissions "}</TradingPermissionsTitle>
                {tokenItems}
                <Collapse isOpen={this.state.collapse}>{tokenItemsMore}</Collapse>
                <ShowMoreButton onClick={this.showMore}>
                    More{" "}
                    <Arrow
                        src={
                            this.state.collapse
                                ? require("../../assets/img/arrow_up_white.png")
                                : require("../../assets/img/arrow_down_white.png")
                        }
                    />
                </ShowMoreButton>
                <WrapETH />
            </TradingPermissionsWrapper>
        );
    }
}

export { TradingPermissions };
