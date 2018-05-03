import { actionsEnums } from "../common/actionsEnums";
import { BigNumber } from "bignumber.js";

/**
 * Default gas price, before recommendations are provided from external source.
 *
 * @type {number}
 */
const DEFAULT_GAS_PRICE = 0;

class GasPriceReducerState {
    recommendedGasPrice: number;

    constructor() {
        this.recommendedGasPrice = DEFAULT_GAS_PRICE;
    }
}

const handlePriceRecommendation = (state: GasPriceReducerState, recommendedGasPrice: BigNumber) => {
    return {
        ...state,
        recommendedGasPrice,
    };
};

export const gasPriceReducer = (
    state: GasPriceReducerState = new GasPriceReducerState(),
    action: any,
) => {
    switch (action.type) {
        case actionsEnums.SET_RECOMMENDED_GAS_PRICE:
            return handlePriceRecommendation(state, action.recommendedGasPrice);
        default:
            return state;
    }
};
