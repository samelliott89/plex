import * as React from "react";
import { Link, browserHistory } from "react-router";
import { ClipLoader } from "react-spinners";

import { amortizationUnitToFrequency, debtOrderFromJSON } from "../../../utils";
import { PaperLayout } from "../../../layouts";
import {
    Header,
    ConfirmOpenLoanModal,
    ConfirmOpenLoanModalType,
    MainWrapper,
    Bold,
} from "../../../components";
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
import { Dharma, Types } from "@dharmaprotocol/dharma.js";

import { BigNumber } from "bignumber.js";
import { OpenCollateralizedDebtEntity, TokenEntity } from "../../../models";
import { web3Errors } from "src/common/web3Errors";
import { BLOCKCHAIN_API } from "../../../common/constants";
import { BarLoader } from "react-spinners";

const ERROR_MESSAGE_MAPPING = {
    "User denied transaction signature": "Wallet has denied transaction.",
    "Creditor balance is insufficient": "Your balance is insufficient to fill this loan.",
    "Creditor allowance is insufficient":
        "Please enable Token Permissions for the principal token in the sidebar.",
};

interface Props {
    location?: any;
    web3: Web3;
    accounts: string[];
    dharma: Dharma;
    tokens: TokenEntity[];
    handleSetError: (errorMessage: string) => void;
    handleFillDebtEntity: (issuanceHash: string) => void;
    updateTokenBalance: (tokenAddress: string, balance: BigNumber) => void;
    recommendedGasPrice: BigNumber;
}

interface States {
    amortizationUnit: string;
    // True if the user has confirmed the order, but the block has not been mined.
    awaitingTransaction: boolean;
    collateralTokenAmount?: Types.TokenAmount;
    confirmationModal: boolean;
    debtEntity?: OpenCollateralizedDebtEntity;
    description: string;
    gracePeriodInDays?: BigNumber;
    interestRate: BigNumber;
    issuanceHash: string;
    principalTokenAmount?: Types.TokenAmount;
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
            description: "",
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
        this.getDebtEntityDetail(this.props.dharma);
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.dharma !== prevProps.dharma) {
            this.getDebtEntityDetail(this.props.dharma);
        }
    }

    async getDebtEntityDetail(dharma: Dharma) {
        try {
            const urlParams = this.props.location.query;
            if (!dharma || !urlParams) {
                return;
            }

            const debtEntity: OpenCollateralizedDebtEntity = debtOrderFromJSON(
                JSON.stringify(urlParams),
            );

            // TODO: Improve parsing of debtOrderInstance
            let { description, principalTokenSymbol, ...filteredUrlParams } = urlParams;

            description = description ? description : "";

            const debtOrderInstance: Types.DebtOrder = debtOrderFromJSON(
                JSON.stringify(filteredUrlParams),
            );

            debtEntity.dharmaOrder = debtOrderInstance;

            const principalTokenAmount = new Types.TokenAmount({
                symbol: principalTokenSymbol,
                amount: new BigNumber(debtEntity.principalAmount),
                type: Types.TokenAmountType.Raw,
            });

            const collateralTokenAmount = new Types.TokenAmount({
                symbol: debtEntity.collateralTokenSymbol,
                amount: new BigNumber(debtEntity.collateralAmount),
                type: Types.TokenAmountType.Raw,
            });

            this.setState({
                amortizationUnit: debtEntity.amortizationUnit,
                collateralTokenAmount,
                debtEntity,
                description,
                gracePeriodInDays: debtEntity.gracePeriodInDays,
                initializing: false,
                interestRate: debtEntity.interestRate,
                issuanceHash: debtEntity.issuanceHash,
                principalTokenAmount,
                termLength: debtEntity.termLength,
            });
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
        const { recommendedGasPrice } = this.props;

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
            const { debtEntity, issuanceHash } = this.state;

            if (!debtEntity) {
                this.props.handleSetError("Unable to find debt order");
                return;
            }

            const debtOrderInstance = debtEntity.dharmaOrder;

            this.setState({ awaitingTransaction: true });

            debtOrderInstance.creditor = accounts[0];
            const txHash = await dharma.order.fillAsync(debtOrderInstance, {
                from: accounts[0],
                gasPrice: recommendedGasPrice,
            });

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
                this.props.handleFillDebtEntity(issuanceHash);

                // HACK: Because principalToken is technically optional,
                //      we have to provide an alternative to it if its undefined
                //      in order to supress typescript errors.
                await this.updateTokenBalance(debtOrderInstance.principalToken || "");

                this.successModalToggle();
            }
        } catch (e) {
            const rawErrorMessages = Object.keys(ERROR_MESSAGE_MAPPING);

            for (const rawErrorMessage of rawErrorMessages) {
                if (rawErrorMessage.includes(e.message)) {
                    this.props.handleSetError(ERROR_MESSAGE_MAPPING[e.message]);

                    this.setState({
                        confirmationModal: false,
                        awaitingTransaction: false,
                    });

                    return;
                }
            }

            this.props.handleSetError(e.message);

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
            collateralTokenAmount,
            description,
            gracePeriodInDays,
            interestRate,
            termLength,
            amortizationUnit,
            principalTokenAmount,
            issuanceHash,
            initializing,
        } = this.state;

        if (initializing || !principalTokenAmount || !collateralTokenAmount) {
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
                    content: principalTokenAmount.toString(),
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

            if (collateralTokenAmount && gracePeriodInDays != null) {
                leftInfoItems.push({
                    title: "Collateral",
                    content: collateralTokenAmount.toString(),
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

                        <ConfirmOpenLoanModal
                            amortizationUnit={amortizationUnit}
                            awaitingTransaction={this.state.awaitingTransaction}
                            collateralTokenAmount={collateralTokenAmount}
                            interestRate={interestRate}
                            modalOpen={this.state.confirmationModal}
                            modalType={ConfirmOpenLoanModalType.Creditor}
                            onConfirm={this.handleFillOrder}
                            onToggle={this.confirmationModalToggle}
                            principalTokenAmount={principalTokenAmount}
                            termLength={termLength}
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
