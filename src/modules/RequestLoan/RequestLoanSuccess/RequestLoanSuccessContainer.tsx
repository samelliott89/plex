import { connect } from "react-redux";
import { RequestLoanSuccess } from "./RequestLoanSuccess";
import { getPendingDebtOrder } from "./actions";

const mapStateToProps = (state: any) => {
    return {
        debtOrder: state.debtOrderReducer.singleDebtOrder,
        dharma: state.dharmaReducer.dharma,
    };
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        getPendingDebtOrder: (issuanceHash: string) => dispatch(getPendingDebtOrder(issuanceHash)),
    };
};

export const RequestLoanSuccessContainer = connect(mapStateToProps, mapDispatchToProps)(
    RequestLoanSuccess,
);
