import { connect } from "react-redux";
import { RequestLoanForm } from "./RequestLoanForm";
import { userRequestDebtOrder } from "./actions";
import { DebtOrderEntity } from "../../../models";
import { setError } from "../../../components/Toast/actions";

import { shortenUrl } from "../../../utils";

const mapStateToProps = (state: any) => {
    return {
        web3: state.web3Reducer.web3,
        accounts: state.web3Reducer.accounts,
        dharma: state.dharmaReducer.dharma,
        tokens: state.tokenReducer.tokens,
        shortenUrl: shortenUrl,
    };
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        handleRequestDebtOrder: (debtOrder: DebtOrderEntity) =>
            dispatch(userRequestDebtOrder(debtOrder)),
        handleSetError: (errorMessage: string) => dispatch(setError(errorMessage)),
    };
};

export const RequestLoanFormContainer = connect(mapStateToProps, mapDispatchToProps)(
    RequestLoanForm,
);
