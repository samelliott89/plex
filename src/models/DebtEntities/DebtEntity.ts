import { BigNumber } from "bignumber.js";
import { DebtOrder } from "@dharmaprotocol/dharma.js/dist/types/src/types";

export class DebtEntity {
    amortizationUnit: string;
    debtor: string;
    description?: string;
    fillLoanShortUrl?: string;
    interestRate: BigNumber;
    issuanceHash: string;
    principalAmount: BigNumber;
    principalTokenSymbol: string;
    termLength: BigNumber;

    dharmaOrder: DebtOrder.Instance;

    /**
     * A base constructor is necessary to enable instantiation of the DebtEntity class and its subclasses.
     * Typescript type guarding using `instanceof` only works when the object considered has been instantiated.
     *
     * https://stackoverflow.com/questions/45964008/typescript-instanceof-not-working
     */
    constructor(params?: any) {
        if (params) {
            for (const key of Object.keys(params)) {
                this[key] = params[key];
            }
        }
    }
}
