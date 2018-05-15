import * as React from "react";
import { Modal, ModalBody, ModalFooter } from "reactstrap";
import { BigNumber } from "bignumber.js";
import { DharmaTypes } from "@dharmaprotocol/dharma.js";

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

interface Props {
    amortizationUnit: string;
    awaitingTransaction?: boolean;
    collateralTokenAmount: DharmaTypes.TokenAmount;
    modalOpen: boolean;
    modalType: ConfirmOpenLoanModalType;
    onSubmit: () => void;
    onToggle?: () => void;
    principalTokenAmount: DharmaTypes.TokenAmount;
    termLength: BigNumber;
}

interface State {
    collateralUsdAmount?: BigNumber;
    perPaymentTokenAmount?: DharmaTypes.TokenAmount;
    perPaymentUsdAmount?: BigNumber;
    principalUsdAmount?: BigNumber;
}

class ConfirmOpenLoanModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
        this.handleToggle = this.handleToggle.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {
        const { collateralTokenAmount, principalTokenAmount, termLength } = this.props;

        const perPaymentTokenAmount = new DharmaTypes.TokenAmount({
            symbol: principalTokenAmount.tokenSymbol,
            amount: principalTokenAmount.rawAmount.div(termLength),
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

    handleToggle() {
        if (this.props.onToggle) {
            this.props.onToggle();
        }
    }

    handleSubmit() {
        this.props.onSubmit();
    }

    render() {
        const { modalType, amortizationUnit, principalTokenAmount, termLength } = this.props;

        const { perPaymentTokenAmount, principalUsdAmount, perPaymentUsdAmount } = this.state;

        if (!perPaymentUsdAmount || !perPaymentTokenAmount || !principalUsdAmount) {
            return null;
        }

        const modalContent =
            modalType === ConfirmOpenLoanModalType.Debtor ? (
                <DebtorModalContent
                    amortizationUnit={amortizationUnit}
                    perPaymentTokenAmount={perPaymentTokenAmount}
                    perPaymentUsdAmount={perPaymentUsdAmount}
                    principalTokenAmount={principalTokenAmount}
                    principalUsdAmount={principalUsdAmount}
                    termLength={termLength}
                />
            ) : (
                <CreditorModalContent
                    amortizationUnit={amortizationUnit}
                    perPaymentTokenAmount={perPaymentTokenAmount}
                    perPaymentUsdAmount={perPaymentUsdAmount}
                    principalTokenAmount={principalTokenAmount}
                    principalUsdAmount={principalUsdAmount}
                    termLength={termLength}
                />
            );

        return (
            <div>
                <Modal
                    isOpen={this.props.modalOpen}
                    toggle={this.handleToggle}
                    keyboard={false}
                    backdrop={"static"}
                >
                    {modalContent}
                    <ModalBody>{"This is some more ModalBody content!"}</ModalBody>
                    <ModalFooter>
                        <div>This is the footer</div>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export { ConfirmOpenLoanModal };
