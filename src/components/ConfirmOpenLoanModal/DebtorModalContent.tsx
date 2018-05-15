import * as React from "react";
import { ModalHeader, ModalBody } from "reactstrap";
const singleLineString = require("single-line-string");

import { ModalContentProps } from "./ConfirmOpenLoanModal";

const DebtorModalContent: React.SFC<ModalContentProps> = (props) => {
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
                {singleLineString`You are requesting ${principalTokenAmount.toString()}
                (${principalUsdAmount.toFormat(2)} USD*)`}
            </ModalHeader>
            <ModalBody>
                <div>
                    {singleLineString`In return, you're promising to make repayments of
                    ${perPaymentTokenAmount.toString()} (${perPaymentUsdAmount.toFormat(
                        2,
                    )} USD*) per ${amortizationUnit.slice(0, -1)} for
                    ${termLength.toNumber()} ${amortizationUnit}.`}
                </div>
            </ModalBody>
        </div>
    );
};

export { DebtorModalContent };
