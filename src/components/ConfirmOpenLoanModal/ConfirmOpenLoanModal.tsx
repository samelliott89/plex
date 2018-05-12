import * as React from "react";
import { Modal, ModalBody, ModalFooter } from "reactstrap";
import { BigNumber } from "bignumber.js";
import { Types } from "@dharmaprotocol/dharma.js";

// import { CreditorModalContent } from "./CreditorModalContent";
// import { DebtorModalContent } from "./DebtorModalContent";

// export declare enum TokenAmountType {
//     Raw = 0,
//     Decimal = 1,
// }

export enum ConfirmOpenLoanModalType {
    Creditor = "Creditor",
    Debtor = "Debtor",
}

export interface ModalContentProps {
    ammortizationUnit: string;
    // perPaymentTokenAmount: TokenAmount;
    // principalTokenAmount: TokenAmount;
    termLength: BigNumber;
}

interface Props {
    modalOpen: boolean;
    modalType: ConfirmOpenLoanModalType;
    onToggle?: () => void;
    onSubmit: () => void;
    awaitingTransaction?: boolean;
}

class ConfirmOpenLoanModal extends React.Component<Props, {}> {
    constructor(props: Props) {
        super(props);
        this.handleToggle = this.handleToggle.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
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
        // const { modalType } = this.props;

        // TODO: take these in as props
        // const ammortizationUnit = "month";
        // const perPaymentTokenAmount = new TokenAmount({
        //     symbol: "WETH",
        //     amount: new BigNumber(50 * 10 ** 18),
        //     type: TokenAmountType.Raw,
        // });
        // const principalTokenAmount = new TokenAmount({
        //     symbol: "WETH",
        //     amount: new BigNumber(600 * 10 ** 18),
        //     type: TokenAmountType.Raw,
        // });
        // const termLength = new BigNumber(12);

        // const modalContent =
        //     modalType === ConfirmOpenLoanModalType.Debtor ? (
        //         <DebtorModalContent
        //             ammortizationUnit={ammortizationUnit}
        //             perPaymentTokenAmount={perPaymentTokenAmount}
        //             principalTokenAmount={principalTokenAmount}
        //             termLength={termLength}
        //         />
        //     ) : (
        //         <CreditorModalContent
        //             ammortizationUnit={ammortizationUnit}
        //             perPaymentTokenAmount={perPaymentTokenAmount}
        //             principalTokenAmount={principalTokenAmount}
        //             termLength={termLength}
        //         />
        //     );

        // const modalContent = new Types.TokenAmount({
        //     symbol: "WETH",
        //     amount: new BigNumber(50 * 10 ** 18),
        //     type: 0,
        // });

        console.log(Types);

        return (
            <div>
                <Modal
                    isOpen={this.props.modalOpen}
                    toggle={this.handleToggle}
                    keyboard={false}
                    backdrop={"static"}
                >
                    {/* {modalContent} */}
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
