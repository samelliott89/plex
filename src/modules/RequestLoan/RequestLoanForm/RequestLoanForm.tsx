// External libraries
import * as React from "react";
import * as Web3 from "web3";
import * as _ from "lodash";
import Dharma from "@dharmaprotocol/dharma.js";
import { BigNumber } from "bignumber.js";
const BitlyClient = require("bitly");
import { browserHistory } from "react-router";

// Schema
import { schema, uiSchema } from "./schema";

// Layouts
import { PaperLayout } from "../../../layouts";

// Models
import { DebtOrderEntity, TokenEntity } from "../../../models";

// Components
import { Header, JSONSchemaForm, MainWrapper, Bold, ConfirmationModal } from "../../../components";
import { RequestLoanDescription } from "./RequestLoanDescription";

// Utils
import {
    encodeUrlParams,
    debtOrderFromJSON,
    normalizeDebtOrder,
    withCommas,
    numberToScaledBigNumber,
} from "../../../utils";

// Validators
import { validateTermLength, validateInterestRate, validateCollateral } from "./validator";

// Common
import { web3Errors } from "../../../common/web3Errors";
import { JSONSchema4 } from "json-schema";

interface Props {
    web3: Web3;
    accounts: string[];
    dharma: Dharma;
    tokens: TokenEntity[];
    handleRequestDebtOrder: (debtOrder: DebtOrderEntity) => void;
    handleSetError: (errorMessage: string) => void;
}

interface State {
    awaitingSignTx: boolean;
    bitly: any;
    confirmationModal: boolean;
    debtOrder: string;
    description: string;
    formData: any;
    interestRate: number;
    issuanceHash: string;
    principalAmount: number;
    principalTokenSymbol: string;
}

class RequestLoanForm extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSignDebtOrder = this.handleSignDebtOrder.bind(this);
        this.confirmationModalToggle = this.confirmationModalToggle.bind(this);
        this.validateForm = this.validateForm.bind(this);
        this.transformErrors = this.transformErrors.bind(this);

        this.state = {
            formData: {},
            principalAmount: 0,
            principalTokenSymbol: "",
            interestRate: 0,
            debtOrder: "",
            description: "",
            issuanceHash: "",
            confirmationModal: false,
            bitly: null,
            awaitingSignTx: false,
        };
    }

    componentDidMount() {
        const bitly = BitlyClient(process.env.REACT_APP_BITLY_ACCESS_TOKEN);
        this.setState({ bitly });
    }

    handleChange(formData: any) {
        this.setState({
            formData: formData,
        });

        if (formData.loan) {
            if (formData.loan.principalAmount) {
                this.setState({ principalAmount: formData.loan.principalAmount });
            }
            if (formData.loan.principalTokenSymbol) {
                this.setState({ principalTokenSymbol: formData.loan.principalTokenSymbol });
            }
            if (formData.loan.description) {
                this.setState({ description: formData.loan.description });
            }
        }

        if (formData.terms && formData.terms.interestRate) {
            this.setState({ interestRate: formData.terms.interestRate });
        }
    }

    async handleSubmit() {
        const { dharma, accounts, handleSetError } = this.props;
        const { principalAmount, principalTokenSymbol } = this.state.formData.loan;
        const { interestRate, amortizationUnit, termLength } = this.state.formData.terms;
        const {
            collateralAmount,
            collateralTokenSymbol,
            gracePeriodInDays,
        } = this.state.formData.collateral;

        try {
            handleSetError("");

            if (!this.props.dharma) {
                handleSetError(web3Errors.UNSUPPORTED_NETWORK);
                return;
            }

            if (!accounts.length) {
                handleSetError(web3Errors.UNABLE_TO_FIND_ACCOUNTS);
                return;
            }

            const collateralTokenDecimals = await dharma.token.getNumDecimals(
                collateralTokenSymbol,
            );
            const principalTokenDecimals = await dharma.token.getNumDecimals(principalTokenSymbol);

            let loanOrder = {
                principalTokenSymbol,
                principalAmount: numberToScaledBigNumber(
                    principalAmount,
                    principalTokenDecimals.toNumber(),
                ),
                interestRate: new BigNumber(interestRate),
                amortizationUnit,
                termLength: new BigNumber(termLength),
            };

            const collateralData = {
                collateralAmount: numberToScaledBigNumber(
                    collateralAmount,
                    collateralTokenDecimals.toNumber(),
                ),
                collateralTokenSymbol,
                gracePeriodInDays: new BigNumber(gracePeriodInDays),
            };

            const collateralizedLoanOrder = Object.assign(loanOrder, collateralData);

            const debtOrder = await dharma.adapters.collateralizedSimpleInterestLoan.toDebtOrder(
                collateralizedLoanOrder,
            );

            debtOrder.debtor = accounts[0];

            const issuanceHash = await dharma.order.getIssuanceHash(debtOrder);

            this.setState({
                debtOrder: JSON.stringify(debtOrder),
                issuanceHash,
            });

            this.confirmationModalToggle();
        } catch (e) {
            this.props.handleSetError(e.message);
            return;
        }
    }

    async handleSignDebtOrder() {
        const { bitly, description, issuanceHash, principalTokenSymbol } = this.state;
        const { handleSetError, handleRequestDebtOrder } = this.props;

        try {
            handleSetError("");

            if (!this.state.debtOrder) {
                handleSetError("No Debt Order has been generated yet");
                return;
            }

            if (!this.props.dharma) {
                handleSetError(web3Errors.UNSUPPORTED_NETWORK);
                return;
            }

            if (!this.props.accounts.length) {
                handleSetError(web3Errors.UNABLE_TO_FIND_ACCOUNTS);
                return;
            }

            this.setState({ awaitingSignTx: true });

            const debtOrder = debtOrderFromJSON(this.state.debtOrder);

            // Sign as debtor
            debtOrder.debtorSignature = await this.props.dharma.sign.asDebtor(debtOrder, true);

            this.setState({
                debtOrder: JSON.stringify(debtOrder),
                awaitingSignTx: false,
                confirmationModal: false,
            });

            const urlParams = Object.assign(
                { description, principalTokenSymbol },
                normalizeDebtOrder(debtOrder),
            );

            const result = await bitly.shorten(
                process.env.REACT_APP_NGROK_HOSTNAME + "/fill/loan?" + encodeUrlParams(urlParams),
            );

            if (result.status_code !== 200) {
                handleSetError("Unable to shorten the url");
                return;
            }

            const fillLoanShortUrl = result.data.url;

            const collateralizedLoanOrder = await this.props.dharma.adapters.collateralizedSimpleInterestLoan.fromDebtOrder(
                debtOrder,
            );

            let storeDebtOrder: DebtOrderEntity = {
                debtor: debtOrder.debtor,
                termsContract: debtOrder.termsContract,
                termsContractParameters: debtOrder.termsContractParameters,
                underwriter: debtOrder.underwriter,
                underwriterRiskRating: debtOrder.underwriteRiskRating,
                amortizationUnit: collateralizedLoanOrder.amortizationUnit,
                interestRate: collateralizedLoanOrder.interestRate,
                principalAmount: debtOrder.principalAmount,
                principalTokenSymbol,
                termLength: collateralizedLoanOrder.termLength,
                issuanceHash,
                repaidAmount: new BigNumber(0),
                repaymentSchedule: [],
                status: "pending",
                json: JSON.stringify(debtOrder),
                creditor: "",
                description,
                fillLoanShortUrl,
                collateralized: true,
                collateralAmount: collateralizedLoanOrder.collateralAmount,
                collateralTokenSymbol: collateralizedLoanOrder.collateralTokenSymbol,
                gracePeriodInDays: collateralizedLoanOrder.gracePeriodInDays,
            };

            handleRequestDebtOrder(storeDebtOrder);
            browserHistory.push(`/request/success/${storeDebtOrder.issuanceHash}`);
        } catch (e) {
            if (e.message.includes("User denied message signature")) {
                handleSetError("Wallet has denied message signature.");
            } else {
                handleSetError(e.message);
            }

            this.setState({
                awaitingSignTx: false,
                confirmationModal: false,
            });
            return;
        }
    }

    confirmationModalToggle() {
        this.setState({
            confirmationModal: !this.state.confirmationModal,
        });
    }

    validateForm(formData: any, errors: any) {
        if (formData.terms.termLength) {
            const error = validateTermLength(formData.terms.termLength);
            if (error) {
                errors.terms.termLength.addError(error);
            }
        }

        if (formData.terms.interestRate) {
            const error = validateInterestRate(formData.terms.interestRate);
            if (error) {
                errors.terms.interestRate.addError(error);
            }
        }

        if (formData.collateral) {
            const response = validateCollateral(this.props.tokens, formData.collateral);
            if (response.error) {
                errors.collateral[response.fieldName].addError(response.error);
            }
        }

        return errors;
    }

    transformErrors(errors: any[]) {
        return errors.map((error) => {
            if (error.name === "oneOf") {
                error.message = "Please fix the errors above";
            }
            return error;
        });
    }

    schemaWithTokens(): JSONSchema4 {
        const { tokens } = this.props;

        const tempSchema = _.clone(schema);

        if (tempSchema.definitions && tempSchema.definitions.tokens) {
            tempSchema.definitions.tokens.enum = _.map(tokens, "symbol");
            tempSchema.definitions.tokens.enumNames = _.map(tokens, "name");
        }

        return tempSchema;
    }

    confirmationModalContent() {
        return (
            <span>
                You are requesting a loan of{" "}
                <Bold>
                    {withCommas(this.state.principalAmount)} {this.state.principalTokenSymbol}
                </Bold>{" "}
                at a <Bold>{this.state.interestRate}%</Bold> interest rate per the terms in the
                contract on the previous page. Are you sure you want to do this?
            </span>
        );
    }

    render() {
        // If there are no tokens yet, we should not render the form.
        if (this.props.tokens.length === 0) {
            return null;
        }

        return (
            <PaperLayout>
                <MainWrapper>
                    <Header title={"Request a Loan"} description={<RequestLoanDescription />} />
                    <JSONSchemaForm
                        schema={this.schemaWithTokens()}
                        uiSchema={uiSchema}
                        formData={this.state.formData}
                        buttonText="Generate Debt Order"
                        onHandleChange={this.handleChange}
                        onHandleSubmit={this.handleSubmit}
                        validate={this.validateForm}
                        transformErrors={this.transformErrors}
                    />
                </MainWrapper>
                <ConfirmationModal
                    modal={this.state.confirmationModal}
                    title="Please confirm"
                    content={this.confirmationModalContent()}
                    onToggle={this.confirmationModalToggle}
                    onSubmit={this.handleSignDebtOrder}
                    closeButtonText="&#8592; Modify Request"
                    submitButtonText={
                        this.state.awaitingSignTx ? "Completing Request..." : "Complete Request"
                    }
                    awaitingTx={this.state.awaitingSignTx}
                    displayMetamaskDependencies={true}
                />
            </PaperLayout>
        );
    }
}

export { RequestLoanForm };
