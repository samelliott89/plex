import { actionsEnums } from "../../../common/actionsEnums";

export const fillDebtEntity = (issuanceHash: string) => {
    return {
        type: actionsEnums.FILL_DEBT_ENTITY,
        payload: issuanceHash,
    };
};
