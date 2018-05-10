import * as React from "react";
import { BigNumber } from "bignumber.js";
import { shallow } from "enzyme";

import MockWeb3 from "../../../../__mocks__/web3";
import MockDharma from "../../../../__mocks__/dharma.js";

import TokenSearch from "../../../../src/components/TradingPermissions/TokenSearch";

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
        it("should render", () => {
            const tokenSearch = shallow(<TokenSearch {...props} />);
            expect(tokenSearch.length).toEqual(1);
        });
    });
});
