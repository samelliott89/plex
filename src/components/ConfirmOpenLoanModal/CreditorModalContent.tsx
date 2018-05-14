import * as React from "react";
import { ModalHeader, ModalBody } from "reactstrap";
const singleLineString = require("single-line-string");

import { ModalContentProps } from "./ConfirmOpenLoanModal";

const CreditorModalContent: React.SFC<ModalContentProps> = (props) => {
    const { ammortizationUnit, perPaymentTokenAmount, principalTokenAmount, termLength } = props;

    // TODO: replace hard-coded USD values
    return (
        <div>
            <ModalHeader>
                {singleLineString`The borrower requests ${principalTokenAmount.toString()}
                (${445248} USD*)`}
            </ModalHeader>
            <ModalBody>
                <div>
                    {singleLineString`In return, they're promising to make repayments of
                    ${perPaymentTokenAmount.toString()} (${40814} USD*) per ${ammortizationUnit} for
                    ${termLength.toNumber()} ${ammortizationUnit}s.`}
                </div>
            </ModalBody>
        </div>
    );
};

export { CreditorModalContent };
