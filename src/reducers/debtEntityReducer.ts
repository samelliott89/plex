import { actionsEnums } from "../common/actionsEnums";
import { DebtEntity } from "../models";

class DebtEntityReducerState {
    debtEntities: Map<string, DebtEntity>;
    filledDebtEntityIssuanceHashes: string[];
    pendingDebtEntityIssuanceHashes: string[];
    singleDebtEntity?: DebtEntity;

    constructor() {
        this.debtEntities = new Map<string, DebtEntity>();
        this.filledDebtEntityIssuanceHashes = [];
        this.pendingDebtEntityIssuanceHashes = [];
    }
}

const handleSetPendingDebtEntity = (state: DebtEntityReducerState, payload: string) => {
    const pendingDebtEntity = state.debtEntities.get(payload);

    const { pendingDebtEntityIssuanceHashes } = state;

    if (!pendingDebtEntityIssuanceHashes.find((issuanceHash) => issuanceHash === payload)) {
        pendingDebtEntityIssuanceHashes.push(payload);
    }

    return {
        ...state,
        pendingDebtEntityIssuanceHashes,
        singleDebtEntity: pendingDebtEntity,
    };
};

const handleRemovePendingDebtEntity = (state: DebtEntityReducerState, payload: string) => {
    const { debtEntities, pendingDebtEntityIssuanceHashes } = state;
    debtEntities.delete(payload);

    return {
        ...state,
        debtEntities,
        pendingDebtEntityIssuanceHashes: pendingDebtEntityIssuanceHashes.filter(
            (issuanceHash) => issuanceHash !== payload,
        ),
    };
};

const handleSetFilledDebtEntities = (
    state: DebtEntityReducerState,
    filledDebtEntities: DebtEntity[],
) => {
    const debtEntities = state.debtEntities;
    const filledDebtEntityIssuanceHashes: string[] = [];

    for (const debtEntity of filledDebtEntities) {
        const issuanceHash = debtEntity.issuanceHash;

        debtEntities.set(issuanceHash, debtEntity);
        if (
            !filledDebtEntityIssuanceHashes.find(
                (existingIssuanceHash: string) => existingIssuanceHash === issuanceHash,
            )
        ) {
            filledDebtEntityIssuanceHashes.push(issuanceHash);
        }
    }

    return {
        ...state,
        debtEntities,
        filledDebtEntityIssuanceHashes,
    };
};

const handleUpdateDebtEntity = (state: DebtEntityReducerState, debtEntity: DebtEntity) => {
    const debtEntities = state.debtEntities;
    debtEntities.set(debtEntity.issuanceHash, debtEntity);

    return {
        ...state,
        debtEntities,
    };
};

export const debtEntityReducer = (
    state: DebtEntityReducerState = new DebtEntityReducerState(),
    action: any,
) => {
    switch (action.type) {
        case actionsEnums.SET_PENDING_DEBT_ENTITY:
            return handleSetPendingDebtEntity(state, action.payload);
        case actionsEnums.FILL_DEBT_ENTITY:
        case actionsEnums.CANCEL_DEBT_ENTITY:
            return handleRemovePendingDebtEntity(state, action.payload);
        case actionsEnums.SET_FILLED_DEBT_ENTITIES:
            return handleSetFilledDebtEntities(state, action.payload);
        case actionsEnums.UPDATE_DEBT_ENTITY:
            return handleUpdateDebtEntity(state, action.debtEntity);
        default:
            return state;
    }
};
