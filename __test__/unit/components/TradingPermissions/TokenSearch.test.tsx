import * as React from "react";
import { BigNumber } from "bignumber.js";
import { shallow } from "enzyme";

import MockWeb3 from "../../../../__mocks__/web3";
import MockDharma from "../../../../__mocks__/dharma.js";

import TokenSearch from "../../../../src/components/TradingPermissions/TokenSearch";
import {
    TokenSearchResults,
    NoTokenResults,
} from "../../../../src/components/TradingPermissions/styledComponents";

describe("TokenSearch (Unit)", () => {
    let web3;
    let dharma;
    let props;

    beforeEach(() => {
        web3 = new MockWeb3();
        dharma = new MockDharma();
        props = {
            tokens: [],
            web3,
            dharma,
            setError: jest.fn(),
            clearToast: jest.fn(),
            handleFaucetRequest: jest.fn(),
            agreeToTerms: true,
            updateProxyAllowanceAsync: jest.fn(),
        };
    });

    describe("#render", () => {
        const tokenSearch = shallow(<TokenSearch {...props} />);

        it("should render", () => {
            expect(tokenSearch.length).toEqual(1);
        });

        it("should render <NoTokenResults /> if there are no tokens", () => {
            expect(tokenSearch.find(NoTokenResults).length).toEqual(1);
        });
    });
});
