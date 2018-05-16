import { connect } from "react-redux";
import { Dharma } from "@dharmaprotocol/dharma.js";
import { RequestLoanSuccess } from "./RequestLoanSuccess";
import { setPendingDebtEntity, updateDebtEntity } from "../../../actions/debtEntityActions";
import { DebtEntity } from "../../../models";

const mapStateToProps = (state: any) => {
    const debtEntity: DebtEntity = state.debtEntityReducer.singleDebtEntity;

    return {
        debtEntity,
        dharma: state.dharmaReducer.dharma as Dharma,
    };
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        updateDebtEntity: (debtEntity: DebtEntity) => dispatch(updateDebtEntity(debtEntity)),
        setPendingDebtEntity: (issuanceHash: string) =>
            dispatch(setPendingDebtEntity(issuanceHash)),
    };
};

export const RequestLoanSuccessContainer = connect(mapStateToProps, mapDispatchToProps)(
    RequestLoanSuccess,
);
