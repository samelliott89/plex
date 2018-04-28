import * as React from "react";
import { Link, browserHistory } from "react-router";
import { ClipLoader } from "react-spinners";

import { amortizationUnitToFrequency, shortenString, debtOrderFromJSON } from "../../../utils";
import { PaperLayout } from "../../../layouts";
import { Header, ConfirmationModal, MainWrapper, Bold, TokenAmount } from "../../../components";
import { SuccessModal } from "./SuccessModal";
import { Col } from "reactstrap";
import {
    LoanInfoContainer,
    HalfCol,
    InfoItem,
    Title,
    Content,
    ButtonContainer,
    DeclineButton,
    FillLoanButton,
    LoaderContainer,
} from "./styledComponents";
import * as Web3 from "web3";
import Dharma from "@dharmaprotocol/dharma.js";
import { DebtOrder } from "@dharmaprotocol/dharma.js/dist/types/src/types";
import { BigNumber } from "bignumber.js";
import { TokenEntity } from "../../../models";
import { web3Errors } from "src/common/web3Errors";
import { BLOCKCHAIN_API } from "../../../common/constants";
import { BarLoader } from "react-spinners";

interface Props {
    location?: any;
    web3: Web3;
    accounts: string[];
    dharma: Dharma;
    tokens: TokenEntity[];
    handleSetError: (errorMessage: string) => void;
    handleFillDebtOrder: (issuanceHash: string) => void;
    updateTokenBalance: (tokenAddress: string, balance: BigNumber) => void;
}

interface States {
    amortizationUnit: string;
    // True if the user has confirmed the order, but the block has not been mined.
    awaitingTransaction: boolean;
    collateralAmount?: BigNumber;
    collateralized?: boolean;
    collateralTokenSymbol?: string;
    confirmationModal: boolean;
    debtOrder: DebtOrder.Instance;
    description: string;
    gracePeriodInDays?: BigNumber;
    interestRate: BigNumber;
    issuanceHash: string;
    principalTokenSymbol: string;
    successModal: boolean;
    termLength: BigNumber;
    initializing: boolean;
}

class FillLoanEntered extends React.Component<Props, States> {
    constructor(props: Props) {
        super(props);

        this.state = {
            confirmationModal: false,
            successModal: false,
            awaitingTransaction: false,
            debtOrder: {},
            description: "",
            principalTokenSymbol: "",
            interestRate: new BigNumber(0),
            termLength: new BigNumber(0),
            amortizationUnit: "",
            issuanceHash: "",
            initializing: true,
        };
        this.confirmationModalToggle = this.confirmationModalToggle.bind(this);
        this.successModalToggle = this.successModalToggle.bind(this);
        this.handleFillOrder = this.handleFillOrder.bind(this);
        this.handleRedirect = this.handleRedirect.bind(this);
    }

    async componentDidMount() {
        this.getDebtOrderDetail(this.props.dharma);
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.dharma !== prevProps.dharma) {
            this.getDebtOrderDetail(this.props.dharma);
        }
    }

    async getDebtOrderDetail(dharma: Dharma) {
        try {
            const urlParams = this.props.location.query;
            if (!dharma || !urlParams) {
                return;
            }
            const debtOrder = debtOrderFromJSON(JSON.stringify(urlParams));
            const description = debtOrder.description;
            const principalTokenSymbol = debtOrder.principalTokenSymbol;
            delete debtOrder.description;
            delete debtOrder.principalTokenSymbol;
            this.setState({ debtOrder, description, principalTokenSymbol });
            if (debtOrder.termsContract && debtOrder.termsContractParameters) {
                const termsContractType = await dharma.contracts.getTermsContractType(
                    debtOrder.termsContract,
                );
                const adapter = await dharma.adapters.getAdapterByTermsContractAddress(
                    debtOrder.termsContract,
                );

                // TODO: cast fromDebtOrder to appropriate type
                const fromDebtOrder = (await adapter.fromDebtOrder(debtOrder)) as any;
                const issuanceHash = await dharma.order.getIssuanceHash(debtOrder);
                this.setState({
                    interestRate: fromDebtOrder.interestRate,
                    termLength: fromDebtOrder.termLength,
                    amortizationUnit: fromDebtOrder.amortizationUnit,
                    issuanceHash: issuanceHash,
                    initializing: false,
                });

                if (termsContractType === "CollateralizedSimpleInterestLoan") {
                    this.setState({
                        collateralAmount: fromDebtOrder.collateralAmount,
                        collateralized: true,
                        collateralTokenSymbol: fromDebtOrder.collateralTokenSymbol,
                        gracePeriodInDays: fromDebtOrder.gracePeriodInDays,
                    });
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    confirmationModalToggle() {
        this.setState({
            confirmationModal: !this.state.confirmationModal,
        });
    }

    async handleFillOrder() {
        try {
            this.props.handleSetError("");
            const { dharma, accounts } = this.props;
            if (!dharma) {
                this.props.handleSetError(web3Errors.UNSUPPORTED_NETWORK);
                return;
            } else if (!accounts.length) {
                this.props.handleSetError(web3Errors.UNABLE_TO_FIND_ACCOUNTS);
                return;
            }
            const { debtOrder, issuanceHash } = this.state;
            this.setState({ awaitingTransaction: true });

            debtOrder.creditor = accounts[0];
            const txHash = await dharma.order.fillAsync(debtOrder, { from: accounts[0] });

            await dharma.blockchain.awaitTransactionMinedAsync(
                txHash,
                BLOCKCHAIN_API.POLLING_INTERVAL,
                BLOCKCHAIN_API.TIMEOUT,
            );

            this.setState({ awaitingTransaction: false });

            const errorLogs = await dharma.blockchain.getErrorLogs(txHash);

            if (errorLogs.length) {
                this.props.handleSetError(errorLogs[0]);
                this.setState({
                    confirmationModal: false,
                });
            } else {
                this.props.handleFillDebtOrder(issuanceHash);

                // HACK: Because principalToken is technically optional,
                //      we have to provide an alternative to it if its undefined
                //      in order to supress typescript errors.
                await this.updateTokenBalance(debtOrder.principalToken || "");

                this.successModalToggle();
            }
        } catch (e) {
            if (e.message.includes("User denied transaction signature")) {
                this.props.handleSetError("Wallet has denied transaction.");
            } else {
                this.props.handleSetError(e.message);
            }

            this.setState({
                confirmationModal: false,
                awaitingTransaction: false,
            });
        }
    }

    async updateTokenBalance(tokenAddress: string) {
        const { dharma, accounts } = this.props;

        const currentBalance = await dharma.token.getBalanceAsync(tokenAddress, accounts[0]);

        this.props.updateTokenBalance(tokenAddress, currentBalance);
    }

    successModalToggle() {
        this.setState({
            confirmationModal: false,
            successModal: !this.state.successModal,
        });
    }

    handleRedirect() {
        browserHistory.push("/dashboard");
    }

    render() {
        const {
            collateralAmount,
            collateralized,
            collateralTokenSymbol,
            debtOrder,
            description,
            gracePeriodInDays,
            interestRate,
            termLength,
            amortizationUnit,
            principalTokenSymbol,
            issuanceHash,
            initializing,
        } = this.state;

        // TODO: replace with TokenAmount object
        const collateralToken = this.props.tokens.find(
            (token) => token.symbol === collateralTokenSymbol,
        );
        const principalToken = this.props.tokens.find(
            (token) => token.symbol === principalTokenSymbol,
        );

        const collateralTokenDecimals = collateralToken
            ? collateralToken.numDecimals
            : new BigNumber(18);
        const principalTokenDecimals = principalToken
            ? principalToken.numDecimals
            : new BigNumber(18);

        if (initializing) {
            return (
                <PaperLayout>
                    <MainWrapper>
                        <Header title={"Fill a Loan"} />
                        <BarLoader width={200} height={10} color={"#1cc1cc"} loading={true} />
                    </MainWrapper>
                </PaperLayout>
            );
        } else {
            const leftInfoItems = [
                {
                    title: "Principal",
                    content: debtOrder.principalAmount ? (
                        <TokenAmount
                            tokenAmount={debtOrder.principalAmount}
                            tokenDecimals={principalTokenDecimals}
                            tokenSymbol={principalTokenSymbol}
                        />
                    ) : (
                        ""
                    ),
                },
                {
                    title: "Term Length",
                    content:
                        termLength && amortizationUnit
                            ? termLength.toNumber() + " " + amortizationUnit
                            : "-",
                },
            ];
            const rightInfoItems = [
                { title: "Interest Rate", content: interestRate.toNumber() + "%" },
                {
                    title: "Installment Frequency",
                    content: amortizationUnit ? amortizationUnitToFrequency(amortizationUnit) : "-",
                },
            ];

            if (
                collateralized &&
                collateralAmount != null &&
                collateralTokenSymbol != null &&
                gracePeriodInDays != null
            ) {
                leftInfoItems.push({
                    title: "Collateral",
                    content: (
                        <TokenAmount
                            tokenAmount={collateralAmount}
                            tokenDecimals={collateralTokenDecimals}
                            tokenSymbol={collateralTokenSymbol}
                        />
                    ),
                });
                rightInfoItems.push({
                    title: "Grace period",
                    content: `${gracePeriodInDays.toNumber()} days`,
                });
            }

            const leftInfoItemRows = leftInfoItems.map((item) => (
                <InfoItem key={item.title}>
                    <Title>{item.title}</Title>
                    <Content>{item.content}</Content>
                </InfoItem>
            ));
            const rightInfoItemRows = rightInfoItems.map((item) => (
                <InfoItem key={item.title}>
                    <Title>{item.title}</Title>
                    <Content>{item.content}</Content>
                </InfoItem>
            ));

            const confirmationModalContent = (
                <span>
                    You will fill this debt order <Bold>{shortenString(issuanceHash)}</Bold>. This
                    operation will debit{" "}
                    <Bold>
                        {debtOrder.principalAmount ? (
                            <TokenAmount
                                tokenAmount={debtOrder.principalAmount}
                                tokenDecimals={principalTokenDecimals}
                                tokenSymbol={principalTokenSymbol}
                            />
                        ) : (
                            ""
                        )}
                    </Bold>{" "}
                    from your account.
                </span>
            );
            const descriptionContent = (
                <span>
                    Here are the details of loan request <Bold>{issuanceHash}</Bold>. If the terms
                    look fair to you, fill the loan and your transaction will be completed.
                </span>
            );
            return (
                <PaperLayout>
                    <MainWrapper>
                        <Header title={"Fill a Loan"} description={descriptionContent} />
                        <LoanInfoContainer>
                            <HalfCol>{leftInfoItemRows}</HalfCol>
                            <HalfCol>{rightInfoItemRows}</HalfCol>
                            <Col xs="12">
                                <InfoItem>
                                    <Title>Description</Title>
                                    <Content>{description}</Content>
                                </InfoItem>
                            </Col>
                        </LoanInfoContainer>
                        <ButtonContainer>
                            <Link to="/fill">
                                <DeclineButton>Decline</DeclineButton>
                            </Link>
                            <FillLoanButton
                                onClick={this.confirmationModalToggle}
                                disabled={this.state.awaitingTransaction}
                            >
                                Fill Loan
                            </FillLoanButton>
                        </ButtonContainer>

                        {this.state.awaitingTransaction && (
                            <Content style={{ textAlign: "center" }}>
                                <LoaderContainer>
                                    <ClipLoader size={18} color={"#1cc1cc"} loading={true} />
                                </LoaderContainer>
                            </Content>
                        )}

                        <ConfirmationModal
                            disabled={this.state.awaitingTransaction}
                            modal={this.state.confirmationModal}
                            title="Please confirm"
                            content={confirmationModalContent}
                            onToggle={this.confirmationModalToggle}
                            onSubmit={this.handleFillOrder}
                            closeButtonText="Cancel"
                            submitButtonText={
                                this.state.awaitingTransaction ? "Filling order..." : "Fill Order"
                            }
                            awaitingTx={this.state.awaitingTransaction}
                            displayMetamaskDependencies={true}
                        />
                        <SuccessModal
                            modal={this.state.successModal}
                            onToggle={this.successModalToggle}
                            issuanceHash={issuanceHash}
                            onRedirect={this.handleRedirect}
                        />
                    </MainWrapper>
                </PaperLayout>
            );
        }
    }
}

export { FillLoanEntered };
