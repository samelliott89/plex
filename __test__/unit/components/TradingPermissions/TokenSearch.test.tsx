import * as Web3 from "web3";
import * as React from "react";
import { BigNumber } from "bignumber.js";
import { shallow, ShallowWrapper } from "enzyme";
import Dharma from "@dharmaprotocol/dharma.js";

import { TOKEN_REGISTRY_TRACKED_TOKENS } from "@dharmaprotocol/dharma.js/dist/lib/utils/constants";

import MockWeb3 from "../../../../__mocks__/web3";
import MockDharma from "../../../../__mocks__/dharma.js";

import { TokenEntity } from "../../../../src/models/TokenEntity";

import { TokenSearch, Props } from "../../../../src/components/TradingPermissions/TokenSearch";
import {
    TokenSearchResults,
    NoTokenResults,
} from "../../../../src/components/TradingPermissions/styledComponents";

describe("TokenSearch (Unit)", () => {
    const mockWeb3 = new MockWeb3() as Web3;
    const mockDharma = new MockDharma() as Dharma;

    const DEFAULT_PROPS: Props = {
        agreeToTerms: true,
        networkId: 1,
        clearToast: jest.fn(),
        dharma: mockDharma,
        handleFaucetRequest: jest.fn(),
        setError: jest.fn(),
        tokens: [],
        updateProxyAllowanceAsync: jest.fn(),
        web3: mockWeb3,
    };

    const BALANCES = {
        REP: new BigNumber(10),
        ZRX: new BigNumber(100),
        MKR: new BigNumber(15),
    };

    const TOKENS: TokenEntity[] = TOKEN_REGISTRY_TRACKED_TOKENS.map((token) => {
        return {
            ...token,
            tradingPermitted: true,
            awaitingTransaction: false,
            balance: BALANCES[token.symbol] || new BigNumber(0),
        };
    });

    function generateComponent(props: Props = DEFAULT_PROPS): ShallowWrapper {
        return shallow(
            <TokenSearch
                agreeToTerms={props.agreeToTerms}
                networkId={props.networkId}
                clearToast={props.clearToast}
                dharma={props.dharma}
                handleFaucetRequest={props.handleFaucetRequest}
                setError={props.setError}
                tokens={props.tokens}
                updateProxyAllowanceAsync={props.updateProxyAllowanceAsync}
                web3={props.web3}
            />,
        );
    }

    describe("#render", () => {
        const tokenSearchWrapper = generateComponent();

        test("should render", () => {
            expect(tokenSearchWrapper.length).toEqual(1);
        });

        test("should render <NoTokenResults /> if there are no tokens", () => {
            expect(tokenSearchWrapper.find(NoTokenResults).length).toEqual(1);
        });
    });

    describe("#tokensToDisplay", () => {
        it("should display the default set of tokens if no query is specified", () => {});
    });
});
