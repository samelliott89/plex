import * as React from "react";
import { TokenEntity, DebtOrderEntity } from "../../../../models";
import { BigNumber } from "bignumber.js";
import { Wrapper, HalfCol, Value, TokenWrapper, Label } from "./styledComponents";
import { TokenAmount } from "src/components";

interface Props {
    debtOrders: DebtOrderEntity[];
    tokens: TokenEntity[];
}

interface State {
    tokenBalances: {
        [key: string]: {
            totalRequested: BigNumber;
            totalRepaid: BigNumber;
        };
    };
}

class DebtsMetrics extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            tokenBalances: {},
        };
    }

    componentDidMount() {
        this.initiateTokenBalance(this.props.tokens);
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.tokens !== prevProps.tokens) {
            this.initiateTokenBalance(this.props.tokens);
        }
    }

    initiateTokenBalance(tokens: TokenEntity[]) {
        if (!tokens || !tokens.length) {
            return;
        }
        const { debtOrders } = this.props;
        let tokenBalances: any = {};
        for (let token of tokens) {
            tokenBalances[token.symbol] = {
                totalRequested: new BigNumber(0),
                totalRepaid: new BigNumber(0),
            };
        }
        for (let debtOrder of debtOrders) {
            if (tokenBalances[debtOrder.principalTokenSymbol]) {
                // TODO: Should we exclude pending debt orders?
                tokenBalances[debtOrder.principalTokenSymbol].totalRequested = tokenBalances[
                    debtOrder.principalTokenSymbol
                ].totalRequested.plus(debtOrder.principalAmount);
                tokenBalances[debtOrder.principalTokenSymbol].totalRepaid = tokenBalances[
                    debtOrder.principalTokenSymbol
                ].totalRepaid.plus(debtOrder.repaidAmount);
            }
        }
        this.setState({ tokenBalances });
    }

    render() {
        const { tokenBalances } = this.state;
        let totalRequestedRows: JSX.Element[] = [];
        let totalRepaidRows: JSX.Element[] = [];
        for (let token in tokenBalances) {
            if (
                tokenBalances[token].totalRequested.gt(0) ||
                tokenBalances[token].totalRepaid.gt(0)
            ) {
                if (tokenBalances[token].totalRequested.gt(0) && totalRequestedRows.length < 4) {
                    if (totalRequestedRows.length === 3) {
                        totalRequestedRows.push(<TokenWrapper key={"more"}>AND MORE</TokenWrapper>);
                    } else {
                        totalRequestedRows.push(
                            <TokenWrapper key={token}>
                                <TokenAmount
                                    tokenAmount={tokenBalances[token].totalRequested}
                                    tokenSymbol={token}
                                />
                            </TokenWrapper>,
                        );
                    }
                }
                if (tokenBalances[token].totalRepaid.gt(0) && totalRepaidRows.length < 4) {
                    if (totalRepaidRows.length === 3) {
                        totalRepaidRows.push(<TokenWrapper key={"more"}>AND MORE</TokenWrapper>);
                    } else {
                        totalRepaidRows.push(
                            <TokenWrapper key={token}>
                                <TokenAmount
                                    tokenAmount={tokenBalances[token].totalRepaid}
                                    tokenSymbol={token}
                                />
                            </TokenWrapper>,
                        );
                    }
                }
            }
        }
        const defaultTotal = <TokenWrapper>0 ETH</TokenWrapper>;
        return (
            <Wrapper>
                <HalfCol>
                    <Value>{totalRequestedRows.length ? totalRequestedRows : defaultTotal}</Value>
                    <Label>Total Owed</Label>
                </HalfCol>
                <HalfCol>
                    <Value>{totalRepaidRows.length ? totalRepaidRows : defaultTotal}</Value>
                    <Label>Total Repaid</Label>
                </HalfCol>
            </Wrapper>
        );
    }
}

export { DebtsMetrics };
