import * as React from "react";
import { Button, Col, Modal, ModalBody, ModalFooter, Row } from "reactstrap";
import { ClipLoader } from "react-spinners";
import { BigNumber } from "bignumber.js";
import { DharmaTypes } from "@dharmaprotocol/dharma.js";
// const { DharmaTypes } = require("@dharmaprotocol/dharma.js");
const singleLineString = require("single-line-string");

import { CreditorModalContent } from "./CreditorModalContent";
import { DebtorModalContent } from "./DebtorModalContent";

import { convertTokenAmountByTicker } from "../../utils";

export enum ConfirmOpenLoanModalType {
    Creditor = "Creditor",
    Debtor = "Debtor",
}

export interface ModalContentProps {
    amortizationUnit: string;
    perPaymentTokenAmount: DharmaTypes.TokenAmount;
    perPaymentUsdAmount: BigNumber;
    principalTokenAmount: DharmaTypes.TokenAmount;
    principalUsdAmount: BigNumber;
    termLength: BigNumber;
}

export interface Props {
    amortizationUnit: string;
    awaitingTransaction?: boolean;
    collateralTokenAmount: DharmaTypes.TokenAmount;
    interestRate: BigNumber;
    modalOpen: boolean;
    modalType: ConfirmOpenLoanModalType;
    onConfirm: () => void;
    onToggle?: () => void;
    principalTokenAmount: DharmaTypes.TokenAmount;
    termLength: BigNumber;
}

interface State {
    collateralUsdAmount?: BigNumber;
    perPaymentTokenAmount?: DharmaTypes.TokenAmount;
    perPaymentUsdAmount?: BigNumber;
    principalUsdAmount?: BigNumber;
    totalOfPaymentsTokenAmount?: DharmaTypes.TokenAmount;
    totalOfPaymentsUsdAmount?: BigNumber;
}

class ConfirmOpenLoanModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    async componentDidMount() {
        await this.getUsdAmounts();
        this.calculateTotalOfPayments();
    }

    async getUsdAmounts() {
        const {
            collateralTokenAmount,
            interestRate,
            principalTokenAmount,
            termLength,
        } = this.props;

        const perPaymentTokenAmount = new DharmaTypes.TokenAmount({
            amount: principalTokenAmount.rawAmount
                .times(interestRate.div(100).plus(1))
                .div(termLength),
            symbol: principalTokenAmount.tokenSymbol,
            type: DharmaTypes.TokenAmountType.Raw,
        });

        const principalUsdAmount = await convertTokenAmountByTicker(principalTokenAmount, "USD");
        const collateralUsdAmount = await convertTokenAmountByTicker(collateralTokenAmount, "USD");
        const perPaymentUsdAmount = await convertTokenAmountByTicker(perPaymentTokenAmount, "USD");

        this.setState({
            collateralUsdAmount,
            perPaymentTokenAmount,
            perPaymentUsdAmount,
            principalUsdAmount,
        });
    }

    calculateTotalOfPayments() {
        const { termLength } = this.props;

        const { perPaymentTokenAmount, perPaymentUsdAmount } = this.state;

        if (!perPaymentTokenAmount || !perPaymentUsdAmount) {
            return;
        }

        const totalOfPaymentsTokenAmount = new DharmaTypes.TokenAmount({
            amount: perPaymentTokenAmount.rawAmount.times(termLength),
            symbol: perPaymentTokenAmount.tokenSymbol,
            type: DharmaTypes.TokenAmountType.Raw,
        });

        const totalOfPaymentsUsdAmount = perPaymentUsdAmount.times(termLength);

        this.setState({
            totalOfPaymentsTokenAmount,
            totalOfPaymentsUsdAmount,
        });
    }

    render() {
        const {
            amortizationUnit,
            awaitingTransaction,
            collateralTokenAmount,
            interestRate,
            modalType,
            onConfirm,
            onToggle,
            principalTokenAmount,
            termLength,
        } = this.props;

        const {
            collateralUsdAmount,
            perPaymentTokenAmount,
            perPaymentUsdAmount,
            principalUsdAmount,
            totalOfPaymentsTokenAmount,
            totalOfPaymentsUsdAmount,
        } = this.state;

        if (
            !collateralUsdAmount ||
            !perPaymentTokenAmount ||
            !perPaymentUsdAmount ||
            !principalUsdAmount ||
            !totalOfPaymentsTokenAmount ||
            !totalOfPaymentsUsdAmount
        ) {
            return null;
        }

        let modalContent: React.ReactElement<any>;
        let confirmButtonText: string;
        let closeButtonText: string;

        if (modalType === ConfirmOpenLoanModalType.Debtor) {
            modalContent = (
                <DebtorModalContent
                    amortizationUnit={amortizationUnit}
                    perPaymentTokenAmount={perPaymentTokenAmount}
                    perPaymentUsdAmount={perPaymentUsdAmount}
                    principalTokenAmount={principalTokenAmount}
                    principalUsdAmount={principalUsdAmount}
                    termLength={termLength}
                />
            );
            confirmButtonText = "Generate Request";
            closeButtonText = "Modify Request";
        } else {
            modalContent = (
                <CreditorModalContent
                    amortizationUnit={amortizationUnit}
                    perPaymentTokenAmount={perPaymentTokenAmount}
                    perPaymentUsdAmount={perPaymentUsdAmount}
                    principalTokenAmount={principalTokenAmount}
                    principalUsdAmount={principalUsdAmount}
                    termLength={termLength}
                />
            );
            confirmButtonText = "Fill Request";
            closeButtonText = "Cancel";
        }

        return (
            <div>
                <Modal
                    isOpen={this.props.modalOpen}
                    toggle={onToggle}
                    keyboard={false}
                    backdrop={"static"}
                >
                    {modalContent}
                    <ModalBody>
                        <Row>
                            <Col>{"Interest Rate"}</Col>
                            <Col className={"align-right"}>{`${interestRate.toNumber()}%`}</Col>
                        </Row>
                        <Row>
                            <Col>{"Total of Payments"}</Col>
                            <Col className={"align-right"}>
                                {`${totalOfPaymentsTokenAmount.toString()} (${totalOfPaymentsUsdAmount.toFormat(
                                    2,
                                )} USD* )`}
                            </Col>
                        </Row>
                        <Row>
                            <Col>{"Collateral"}</Col>
                            <Col className={"align-right"}>
                                {`${collateralTokenAmount.toString()} (${collateralUsdAmount.toFormat(
                                    2,
                                )} USD* )`}
                            </Col>
                        </Row>
                        <Row>
                            {singleLineString`* All conversions to USD are estimates.
                                Borrowers and lenders should understand that token values are volatile.`}
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Row className="button-container">
                            <Col>
                                <Button
                                    className="button secondary width-95"
                                    disabled={!!awaitingTransaction}
                                    onClick={onToggle}
                                >
                                    {closeButtonText}
                                </Button>
                            </Col>

                            <Col className={"align-right"}>
                                <Button
                                    className={"button width-95"}
                                    disabled={!!awaitingTransaction}
                                    onClick={onConfirm}
                                >
                                    {confirmButtonText}
                                    <ClipLoader
                                        size={12}
                                        color={"#FFFFFF"}
                                        loading={!!awaitingTransaction}
                                    />
                                </Button>
                            </Col>
                        </Row>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export { ConfirmOpenLoanModal };
