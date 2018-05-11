import { connect } from "react-redux";
import { RequestLoanForm } from "./RequestLoanForm";
import { setPendingDebtEntity, updateDebtEntity } from "../../../actions/debtEntityActions";
import { DebtEntity } from "../../../models";
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
        updateDebtEntity: (debtEntity: DebtEntity) => dispatch(updateDebtEntity(debtEntity)),
        handleSetError: (errorMessage: string) => dispatch(setError(errorMessage)),
        setPendingDebtEntity: (issuanceHash: string) =>
            dispatch(setPendingDebtEntity(issuanceHash)),
    };
};

export const RequestLoanFormContainer = connect(mapStateToProps, mapDispatchToProps)(
    RequestLoanForm,
);
