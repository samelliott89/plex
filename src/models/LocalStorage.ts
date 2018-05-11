import { DebtEntity } from "../models";

export const loadState = () => {
    try {
        const serializedState = localStorage.getItem(
            process.env.REACT_APP_LOCAL_STORAGE_KEY_PREPEND + "state",
        );
        if (serializedState === null) {
            return undefined;
        }

        const state = JSON.parse(serializedState);
        state.debtEntityReducer.debtEntities = new Map<string, DebtEntity>(
            state.debtEntityReducer.debtEntities,
        );

        // TODO(kayvon): set default values for those properties of `state` that are not saved to
        // local storage.
        if (!state.debtEntityReducer.pendingDebtEntityIssuanceHashes) {
            state.debtEntityReducer.pendingDebtEntityIssuanceHashes = [];
        }

        if (!state.debtEntityReducer.filledDebtEntityIssuanceHashes) {
            state.debtEntityReducer.filledDebtEntityIssuanceHashes = [];
        }

        return state;
    } catch (err) {
        return undefined;
    }
};

export const saveState = (state: any) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem(
            process.env.REACT_APP_LOCAL_STORAGE_KEY_PREPEND + "state",
            serializedState,
        );
    } catch (err) {
        // console.log(err);
    }
};
