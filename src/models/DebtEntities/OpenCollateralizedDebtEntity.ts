import { BigNumber } from "bignumber.js";
import { OpenDebtEntity } from "./OpenDebtEntity";
import { CollateralParameters } from "../DebtInterfaces";

export class OpenCollateralizedDebtEntity extends OpenDebtEntity implements CollateralParameters {
    collateralAmount: BigNumber; // raw amount
    collateralTokenSymbol: string;
    gracePeriodInDays: BigNumber;
}
