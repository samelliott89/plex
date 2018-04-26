import { TokenEntity } from "../../../src/models/TokenEntity";
import { BigNumber } from "bignumber.js";

describe("TokenEntity", () => {
    it("should have the correct properties", () => {
        const tokenEntity = new TokenEntity();
        const testTokenEntity = {
            address: "",
            symbol: "",
            name: "",
            tradingPermitted: false,
            awaitingTransaction: false,
            balance: new BigNumber(0),
            numDecimals: new BigNumber(0),
        };
        expect(tokenEntity).toEqual(testTokenEntity);
    });
});
