import { actionsEnums } from "../common/actionsEnums";
import { DebtEntity } from "../models";

export const setPendingDebtEntity = (issuanceHash: string) => {
    return {
        type: actionsEnums.SET_PENDING_DEBT_ENTITY,
        payload: issuanceHash,
    };
};

export const updateDebtEntity = (debtEntity: DebtEntity) => {
    return {
        debtEntity,
        type: actionsEnums.UPDATE_DEBT_ENTITY,
    };
};
