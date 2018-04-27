import * as React from "react";
import * as _ from "lodash";
import { Router, Route, IndexRoute, browserHistory } from "react-router";
import { syncHistoryWithStore } from "react-router-redux";
import { AppContainer } from "../AppContainer";
import {
    WelcomeContainer,
    FillLoanEmpty,
    DefaultContent,
    TestForm,
    RequestLoanFormContainer,
    RequestLoanSuccessContainer,
    DashboardContainer,
    FillLoanEnteredContainer,
    TermsContainer,
    Privacy,
    EnsureAgreedToTermsContainer,
} from "../modules";
import { ParentContainer } from "../layouts";
import * as Web3 from "web3";
import { web3Connected, dharmaInstantiated, setAccounts, setNetworkId } from "./actions";
import { setError } from "../components/Toast/actions";
import { web3Errors } from "../common/web3Errors";
import { SUPPORTED_NETWORK_IDS } from "../common/constants";
const promisify = require("tiny-promisify");

// Import Dharma libraries
import Dharma from "@dharmaprotocol/dharma.js";

interface Props {
    store: any;
    env: string;
}

class AppRouter extends React.Component<Props, {}> {
    constructor(props: Props) {
        super(props);
    }

    async componentDidMount() {
        const { store, env } = this.props;
        const dispatch = store.dispatch;

        try {
            const web3 = await this.connectToWeb3(env);
            dispatch(web3Connected(web3));

            const networkID = await this.getNetworkID(web3);
            dispatch(setNetworkId(networkID));

            const accounts = await this.getAccounts(web3);
            dispatch(setAccounts(accounts));

            const dharma = await this.instantiateDharma(web3);
            dispatch(dharmaInstantiated(dharma));
        } catch (e) {
            dispatch(setError(e.message));
        }
    }

    async connectToWeb3(env: string): Promise<Web3> {
        let web3: Web3;

        if (typeof (window as any).web3 !== "undefined") {
            web3 = await new Web3((window as any).web3.currentProvider);
        } else if (env === "test") {
            web3 = await new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        } else {
            throw new Error(web3Errors.UNABLE_TO_FIND_WEB3_PROVIDER);
        }

        if (web3.isConnected()) {
            return web3;
        } else {
            throw new Error(web3Errors.UNABLE_TO_CONNECT_TO_NETWORK);
        }
    }

    async getNetworkID(web3: Web3): Promise<number> {
        const networkIdString = await promisify(web3.version.getNetwork)();
        const networkID = parseInt(networkIdString, 10);

        if (_.includes(SUPPORTED_NETWORK_IDS, networkID)) {
            return networkID;
        } else {
            throw new Error(web3Errors.UNSUPPORTED_NETWORK);
        }
    }

    async getAccounts(web3: Web3): Promise<string[]> {
        const accounts = await promisify(web3.eth.getAccounts)();
        if (accounts.length) {
            return accounts;
        } else {
            throw new Error(web3Errors.UNABLE_TO_FIND_ACCOUNTS);
        }
    }

    async instantiateDharma(web3: Web3) {
        return new Dharma(web3.currentProvider);
    }

    render() {
        const history = syncHistoryWithStore(browserHistory, this.props.store);
        return (
            <Router history={history}>
                <Route path="/" component={AppContainer}>
                    <IndexRoute component={WelcomeContainer} />
                    <Route component={EnsureAgreedToTermsContainer}>
                        <Route path="/dashboard" component={DashboardContainer} />
                        <Route path="/request" component={ParentContainer}>
                            <IndexRoute component={RequestLoanFormContainer} />
                            <Route
                                path="success/:issuanceHash"
                                component={RequestLoanSuccessContainer}
                            />
                        </Route>
                        <Route path="/fill" component={ParentContainer}>
                            <IndexRoute component={FillLoanEmpty} />
                            <Route path="loan" component={FillLoanEnteredContainer} />
                        </Route>
                    </Route>
                    <Route path="/plex" component={DefaultContent} />
                    <Route path="/whitepaper" component={DefaultContent} />
                    <Route path="/blog" component={DefaultContent} />
                    <Route path="/github" component={DefaultContent} />
                    <Route path="/chat" component={DefaultContent} />
                    <Route path="/twitter" component={DefaultContent} />
                    <Route path="/test" component={TestForm} />
                    <Route path="/terms" component={TermsContainer} />
                    <Route path="/privacy" component={Privacy} />
                </Route>
            </Router>
        );
    }
}

export { AppRouter };
