import * as React from "react";
import { ModalHeader, ModalBody } from "reactstrap";
const singleLineString = require("single-line-string");

import { ModalContentProps } from "./ConfirmOpenLoanModal";

const CreditorModalContent: React.SFC<ModalContentProps> = (props) => {
    const {
        amortizationUnit,
        perPaymentTokenAmount,
        perPaymentUsdAmount,
        principalTokenAmount,
        principalUsdAmount,
        termLength,
    } = props;

    return (
        <div>
            <ModalHeader>
                {singleLineString`The borrower requests ${principalTokenAmount.toString()}
                (${principalUsdAmount.toNumber()} USD*)`}
            </ModalHeader>
            <ModalBody>
                <div>
                    {singleLineString`In return, they're promising to make repayments of
                    ${perPaymentTokenAmount.toString()} (${perPaymentUsdAmount.toNumber()} USD*) per ${amortizationUnit} for
                    ${termLength.toNumber()} ${amortizationUnit}s.`}
                </div>
            </ModalBody>
        </div>
    );
};

export { CreditorModalContent };
