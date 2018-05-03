import { actionsEnums } from "../../common/actionsEnums";

export const setError = (errorMessage: string) => {
    return {
        type: actionsEnums.SET_ERROR_TOAST,
        errorMessage: errorMessage,
    };
};

export const setInfo = (infoMessage: string) => {
    return {
        type: actionsEnums.SET_INFO_TOAST,
        infoMessage: infoMessage,
    };
};

export const setSuccess = (successMessage: string | JSX.Element) => {
    return {
        type: actionsEnums.SET_SUCCESS_TOAST,
        successMessage: successMessage,
    };
};

export const clearToast = () => {
    return {
        type: actionsEnums.CLEAR_TOAST,
    };
};
