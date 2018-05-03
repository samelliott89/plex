import * as React from "react";
import { PageLayout } from "./layouts";
import * as Web3 from "web3";
import * as ReactGA from "react-ga";

const Intercom = require("react-intercom").default;
const promisify = require("tiny-promisify");

interface Props {
    web3: Web3;
    accounts: string[];
}

interface State {
    intervalId: any;
}

// Initialize Google Analytics
ReactGA.initialize("UA-98616406-4");

class App extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            intervalId: undefined,
        };
    }

    componentDidMount() {
        const intervalId = setInterval(
            () => this.checkAccount(this.props.web3, this.props.accounts),
            1000,
        );
        this.setState({ intervalId });
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalId);
    }

    async checkAccount(web3: Web3, accounts: string[]) {
        if (!web3 || !accounts) {
            return;
        }
        const latestAccounts = await promisify(web3.eth.getAccounts)();
        if (latestAccounts.length && accounts.length && latestAccounts[0] !== accounts[0]) {
            localStorage.clear();
            window.location.reload();
        }
    }

    render() {
        return (
            <PageLayout>
                {this.props.children}
                <Intercom appID={"ll37s9fu"} />
            </PageLayout>
        );
    }
}

export { App };
