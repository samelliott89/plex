import { BigNumber } from "bignumber.js";

export class TokenEntity {
    address: string;
    symbol: string;
    name: string;
    numDecimals: BigNumber;
    tradingPermitted: boolean;
    awaitingTransaction: boolean;
    balance: BigNumber;

    public constructor() {
        this.address = "";
        this.symbol = "";
        this.name = "";
        this.tradingPermitted = false;
        this.awaitingTransaction = false;
        this.balance = new BigNumber(0);
        this.numDecimals = new BigNumber(0);
    }
}
