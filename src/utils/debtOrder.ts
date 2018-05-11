import { BigNumber } from "bignumber.js";
import { DebtOrder } from "@dharmaprotocol/dharma.js/dist/types/src/types";
import { DebtQueryParams, OpenCollateralizedDebtEntity } from "../models";

export const amortizationUnitToFrequency = (unit: string) => {
    let frequency: string = "";
    switch (unit) {
        case "hours":
            frequency = "Hourly";
            break;
        case "days":
            frequency = "Daily";
            break;
        case "weeks":
            frequency = "Weekly";
            break;
        case "months":
            frequency = "Monthly";
            break;
        case "years":
            frequency = "Yearly";
            break;
        default:
            break;
    }
    return frequency;
};

export const normalizeDebtOrder = (debtOrder: DebtOrder.Instance) => {
    const _debtOrder = {
        ...debtOrder,
        principalAmount: debtOrder!.principalAmount!.toNumber(),
        debtorFee: debtOrder!.debtorFee!.toNumber(),
        creditorFee: debtOrder!.creditorFee!.toNumber(),
        relayerFee: debtOrder!.relayerFee!.toNumber(),
        underwriterFee: debtOrder!.underwriterFee!.toNumber(),
        underwriterRiskRating: debtOrder!.underwriterRiskRating!.toNumber(),
        expirationTimestampInSec: debtOrder!.expirationTimestampInSec!.toNumber(),
        salt: debtOrder!.salt!.toNumber(),
        debtorSignature: JSON.stringify(debtOrder.debtorSignature),
        creditorSignature: JSON.stringify(debtOrder.creditorSignature),
        underwriterSignature: JSON.stringify(debtOrder.underwriterSignature),
    };
    return _debtOrder;
};

export const normalize = (debtOrder: any) => {
    const normalizedDebtOrder = {};
    Object.keys(debtOrder).map((key: string, index: number) => {
        const value = debtOrder[key];

        if (value instanceof BigNumber) {
            normalizedDebtOrder[key] = value.toNumber();
        } else if (typeof value === "object") {
            normalizedDebtOrder[key] = JSON.stringify(value);
        } else {
            normalizedDebtOrder[key] = value;
        }
    });

    return normalizedDebtOrder;
};

export const debtOrderFromJSON = (debtOrderJSON: string) => {
    const debtOrder = JSON.parse(debtOrderJSON);
    if (debtOrder.principalAmount && !(debtOrder.principalAmount instanceof BigNumber)) {
        debtOrder.principalAmount = new BigNumber(debtOrder.principalAmount);
    }
    if (debtOrder.debtorFee && !(debtOrder.debtorFee instanceof BigNumber)) {
        debtOrder.debtorFee = new BigNumber(debtOrder.debtorFee);
    }
    if (debtOrder.creditorFee && !(debtOrder.creditorFee instanceof BigNumber)) {
        debtOrder.creditorFee = new BigNumber(debtOrder.creditorFee);
    }
    if (debtOrder.relayerFee && !(debtOrder.relayerFee instanceof BigNumber)) {
        debtOrder.relayerFee = new BigNumber(debtOrder.relayerFee);
    }
    if (debtOrder.underwriterFee && !(debtOrder.underwriterFee instanceof BigNumber)) {
        debtOrder.underwriterFee = new BigNumber(debtOrder.underwriterFee);
    }
    if (
        debtOrder.underwriterRiskRating &&
        !(debtOrder.underwriterRiskRating instanceof BigNumber)
    ) {
        debtOrder.underwriterRiskRating = new BigNumber(debtOrder.underwriterRiskRating);
    }
    if (
        debtOrder.expirationTimestampInSec &&
        !(debtOrder.expirationTimestampInSec instanceof BigNumber)
    ) {
        debtOrder.expirationTimestampInSec = new BigNumber(debtOrder.expirationTimestampInSec);
    }
    if (debtOrder.gracePeriodInDays && !(debtOrder.gracePeriodInDays instanceof BigNumber)) {
        debtOrder.gracePeriodInDays = new BigNumber(debtOrder.gracePeriodInDays);
    }
    if (debtOrder.salt && !(debtOrder.salt instanceof BigNumber)) {
        debtOrder.salt = new BigNumber(debtOrder.salt);
    }
    if (debtOrder.termLength && !(debtOrder.termLength instanceof BigNumber)) {
        debtOrder.termLength = new BigNumber(debtOrder.termLength);
    }
    if (debtOrder.interestRate && !(debtOrder.interestRate instanceof BigNumber)) {
        debtOrder.interestRate = new BigNumber(debtOrder.interestRate);
    }
    if (debtOrder.repaidAmount && !(debtOrder.repaidAmount instanceof BigNumber)) {
        debtOrder.repaidAmount = new BigNumber(debtOrder.repaidAmount);
    }
    if (typeof debtOrder.debtorSignature === "string") {
        debtOrder.debtorSignature = JSON.parse(debtOrder.debtorSignature);
    }
    if (typeof debtOrder.creditorSignature === "string") {
        debtOrder.creditorSignature = JSON.parse(debtOrder.creditorSignature);
    }
    if (typeof debtOrder.underwriterSignature === "string") {
        debtOrder.underwriterSignature = JSON.parse(debtOrder.underwriterSignature);
    }
    return debtOrder;
};

/**
 * Given an OpenCollateralizedDebtOrder, returns normalized DebtQueryParams
 * to be used as queryParams in a URL.
 *
 * @param {OpenCollateralizedDebtEntity} debtEntity
 * @returns {any}
 */
export const generateDebtQueryParams = (debtEntity: OpenCollateralizedDebtEntity): any => {
    const { dharmaOrder, ...filteredDebtEntity } = debtEntity;
    const { principalAmount, ...filteredDharmaOrder } = dharmaOrder as any;

    const debtQueryParams: DebtQueryParams = {
        ...filteredDebtEntity,
        ...filteredDharmaOrder,
    };

    return normalize(debtQueryParams);
};
