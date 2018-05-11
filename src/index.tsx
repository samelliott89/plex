import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppRouter } from "./router/router";
import registerServiceWorker from "./registerServiceWorker";
import "bootstrap/dist/css/bootstrap.css";
import "font-awesome/css/font-awesome.css";
import "./assets/css/index.css";
import "font-awesome/css/font-awesome.css";

import { loadState, saveState } from "./models";

import { createStore, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import { reducers } from "./reducers";
import reduxThunk from "redux-thunk";
const throttle = require("lodash/throttle");

const devToolsKey: string = "devToolsExtension";

const persistedState = loadState();

const env = process.env.NODE_ENV || "unknown";

let store = createStore(
    reducers,
    persistedState,
    compose(
        applyMiddleware(reduxThunk),
        window[devToolsKey] ? window[devToolsKey]() : (f: any) => f,
    ),
);

store.subscribe(
    throttle(() => {
        saveState({
            debtEntityReducer: {
                debtEntities: store.getState().debtEntityReducer.debtEntities,
                filledDebtEntityIssuanceHashes: [],
                pendingDebtEntityIssuanceHashes: store.getState().debtEntityReducer
                    .pendingDebtEntityIssuanceHashes,
            },
            plexReducer: store.getState().plexReducer,
        });
    }, 1000),
);

ReactDOM.render(
    <Provider store={store}>
        <AppRouter store={store} env={env} />
    </Provider>,
    document.getElementById("root") as HTMLElement,
);
registerServiceWorker();
