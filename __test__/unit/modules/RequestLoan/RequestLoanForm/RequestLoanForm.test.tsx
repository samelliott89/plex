// External libraries
import * as React from "react";
import * as Web3 from "web3";
import { shallow, ShallowWrapper } from "enzyme";
import { BigNumber } from "bignumber.js";
const singleLineString = require("single-line-string");

// Layouts
import { PaperLayout } from "../../../../../src/layouts";

import { RequestLoanForm } from "../../../../../src/modules/RequestLoan/RequestLoanForm/RequestLoanForm";

import {
    Header,
    JSONSchemaForm,
    MainWrapper,
    ConfirmationModal,
} from "../../../../../src/components";

// Mocks
import MockWeb3 from "../../../../../__mocks__/web3";
import MockDharma from "../../../../../__mocks__/dharma.js";

// Utils
import { debtOrderFromJSON, numberToScaledBigNumber } from "../../../../../src/utils";

import MockBitlyClient from "../../../../../__mocks__/BitlyClient";

describe("<RequestLoanForm />", () => {
    let web3: Web3;
    // A mocked instance of Dharma.
    let dharma: Object;
    let props: Object;

    let wrapper: ShallowWrapper;

    beforeEach(() => {
        web3 = new MockWeb3();
        dharma = new MockDharma();

        props = {
            web3,
            accounts: ["accounts1"],
            dharma,
            handleRequestDebtOrder: jest.fn(),
            handleSetError: jest.fn(),
            tokens: [
                {
                    address: "0x9b62bd396837417ce319e2e5c8845a5a960010ea",
                    symbol: "REP",
                    name: "REP",
                    tradingPermitted: true,
                    balance: new BigNumber(10000),
                    numDecimals: new BigNumber(18),
                },
            ],
            shortenUrl: jest.fn(),
        };

        wrapper = shallow(<RequestLoanForm {...props} />);
    });

    describe("#render", () => {
        it("should render", () => {
            expect(wrapper.length).toEqual(1);
        });

        it("should render a <Header />", () => {
            expect(
                wrapper
                    .find(PaperLayout)
                    .find(MainWrapper)
                    .find(Header).length,
            ).toEqual(1);
        });

        it("should render a <JSONSchemaForm />", () => {
            expect(
                wrapper
                    .find(PaperLayout)
                    .find(MainWrapper)
                    .find(JSONSchemaForm).length,
            ).toEqual(1);
        });

        it("should render a <ConfirmationModal />", () => {
            expect(wrapper.find(PaperLayout).find(ConfirmationModal).length).toEqual(1);
        });
    });

    describe("#handleChange", () => {
        let spy;

        beforeEach(() => {
            spy = jest.spyOn(wrapper.instance(), "setState");
        });

        it("should set formData", () => {
            const formData = {};
            wrapper.instance().handleChange(formData);
            expect(spy).toHaveBeenCalledWith({ formData });
        });

        it("should set principalAmount", () => {
            const formData = {
                loan: {
                    principalAmount: new BigNumber(10),
                },
            };
            wrapper.instance().handleChange(formData);
            expect(spy).toHaveBeenCalledWith({ principalAmount: formData.loan.principalAmount });
        });

        it("should set principalTokenSymbol", () => {
            const formData = {
                loan: {
                    principalTokenSymbol: "REP",
                },
            };
            wrapper.instance().handleChange(formData);
            expect(spy).toHaveBeenCalledWith({
                principalTokenSymbol: formData.loan.principalTokenSymbol,
            });
        });

        it("should set description", () => {
            const formData = {
                loan: {
                    description: "Some description",
                },
            };
            wrapper.instance().handleChange(formData);
            expect(spy).toHaveBeenCalledWith({ description: formData.loan.description });
        });

        it("should set interestRate", () => {
            const formData = {
                terms: {
                    interestRate: new BigNumber(3.2),
                },
            };
            wrapper.instance().handleChange(formData);
            expect(spy).toHaveBeenCalledWith({ interestRate: formData.terms.interestRate });
        });
    });

    describe("#handleSubmit", () => {
        const formData = {
            loan: {
                principalAmount: 10,
                principalTokenSymbol: "REP",
            },
            terms: {
                interestRate: 10,
                amortizationUnit: "hours",
                termLength: 10,
            },
            collateral: {
                collateralAmount: 10,
                collateralTokenSymbol: "REP",
                gracePeriodInDays: 3,
            },
        };

        const collateralizedLoanOrder = {
            principalTokenSymbol: formData.loan.principalTokenSymbol,
            principalAmount: numberToScaledBigNumber(formData.loan.principalAmount, 18),
            interestRate: new BigNumber(formData.terms.interestRate),
            amortizationUnit: formData.terms.amortizationUnit,
            termLength: new BigNumber(formData.terms.termLength),
            collateralAmount: numberToScaledBigNumber(formData.collateral.collateralAmount, 18),
            collateralTokenSymbol: formData.collateral.collateralTokenSymbol,
            gracePeriodInDays: new BigNumber(formData.collateral.gracePeriodInDays),
        };

        beforeEach(() => {
            wrapper.instance().handleChange(formData);
        });

        it("should clear error", async () => {
            await wrapper.instance().handleSubmit();
            expect(props.handleSetError).toHaveBeenCalledWith("");
        });

        it("should call Dharma#toDebtOrder", async () => {
            await wrapper.instance().handleSubmit();
            expect(
                dharma.adapters.collateralizedSimpleInterestLoan.toDebtOrder,
            ).toHaveBeenCalledWith(collateralizedLoanOrder);
        });

        it("should call Dharma#getIssuanceHash", async () => {
            const debtOrder = await dharma.adapters.collateralizedSimpleInterestLoan.toDebtOrder(
                collateralizedLoanOrder,
            );
            debtOrder.debtor = props.accounts[0];
            await wrapper.instance().handleSubmit();
            await expect(dharma.order.getIssuanceHash).toHaveBeenCalledWith(debtOrder);
        });

        it("should call set debtOrder and issuanceHash", async () => {
            const spy = jest.spyOn(wrapper.instance(), "setState");

            const debtOrder = {
                ...collateralizedLoanOrder,
                debtor: props.accounts[0],
            };

            await wrapper.instance().handleSubmit();
            const issuanceHash = await dharma.order.getIssuanceHash(debtOrder);
            expect(spy).toHaveBeenCalledWith({
                debtOrder: JSON.stringify(debtOrder),
                issuanceHash,
            });
        });

        it("should call confirmationModalToggle", async () => {
            const spy = jest.spyOn(wrapper.instance(), "confirmationModalToggle");
            await wrapper.instance().handleSubmit();
            expect(spy).toHaveBeenCalled();
        });

        it("should call handleSetError when there is an error", async () => {
            const errorMessage = "Some error message";

            dharma.adapters.collateralizedSimpleInterestLoan.toDebtOrder = jest.fn(async () => {
                throw new Error(errorMessage);
            });
            await wrapper.instance().handleSubmit();
            expect(props.handleSetError).toHaveBeenCalledWith(errorMessage);

            dharma.adapters.collateralizedSimpleInterestLoan.toDebtOrder = jest.fn(
                async (collateralizedLoanOrder) => {
                    return { ...collateralizedLoanOrder };
                },
            );
        });
    });

    describe("#handleSignDebtOrder", () => {
        const debtOrder = singleLineString`
            {
               "principalToken":"0x9b62bd396837417ce319e2e5c8845a5a960010ea",
               "principalAmount":"10",
               "termsContract":"0x1c907384489d939400fa5c6571d8aad778213d74",
               "termsContractParameters":"0x0000000000000000000000000000008500000000000000000000000000000064",
               "kernelVersion":"0x89c5b853e9e32bf47c7da1ccb02e981b74c47f2f",
               "issuanceVersion":"0x1d8e76d2022e017c6c276b44cb2e4c71bd3cc3de",
               "debtor":"0x431194c3e0f35bc7f1266ec6bb85e0c5ec554935",
               "debtorFee":"0",
               "creditor":"0x0000000000000000000000000000000000000000",
               "creditorFee":"0",
               "relayer":"0x0000000000000000000000000000000000000000",
               "relayerFee":"0",
               "underwriter":"0x0000000000000000000000000000000000000000",
               "underwriterFee":"0",
               "underwriterRiskRating":"0",
               "expirationTimestampInSec":"1524613355",
               "salt":"0",
               "debtorSignature":{
                  "v":1,
                  "r":"sometext",
                  "s":"sometext"
               },
               "creditorSignature":{
                  "v":27,
                  "r":"0xc5c0aaf7b812cb865aef48958e2d39686a13c292f8bd4a82d7b43d833fb5047d",
                  "s":"0x2fbbe9f0b8e12ed2875905740fa010bbe710c3e0c131f1efe14fb41bb7921788"
               },
               "underwriterSignature":{
                  "r":"",
                  "s":"",
                  "v":0
               }
            }`;

        it("should clear error", async () => {
            await wrapper.instance().handleSignDebtOrder();
            expect(props.handleSetError).toHaveBeenCalledWith("");
        });

        it("should set error when there is no debtOrder", async () => {
            wrapper.setState({ debtOrder: null });
            await wrapper.instance().handleSignDebtOrder();
            expect(props.handleSetError).toHaveBeenCalledWith(
                "No Debt Order has been generated yet",
            );
        });

        it("should call Dharma#asDebtor", async () => {
            wrapper.setState({ debtOrder });
            const expectedDebtOrder = debtOrderFromJSON(debtOrder);
            await wrapper.instance().handleSignDebtOrder();
            await expect(dharma.sign.asDebtor).toHaveBeenCalledWith(expectedDebtOrder, true);
        });

        it("should call shortenUrl", async () => {
            wrapper.setState({ debtOrder });
            await wrapper.instance().handleSignDebtOrder();
            await expect(props.shortenUrl).toHaveBeenCalledTimes(1);
        });

        it("should set error when shortenUrl fails", async () => {
            props.shortenUrl = jest.fn(async (value) => {
                return { status_code: 400 };

            wrapper = shallow(<RequestLoanForm {...props} />);
            wrapper.setState({ debtOrder });

            await wrapper.instance().handleSignDebtOrder();
            await expect(props.handleSetError).toHaveBeenCalledWith("Unable to shorten the url");
        });
    });

    describe("#confirmationModalToggle", () => {
        it("should set confirmationModal state", () => {
            const spy = jest.spyOn(wrapper.instance(), "setState");
            const confirmationModal = wrapper.state("confirmationModal");
            wrapper.instance().confirmationModalToggle();
            expect(spy).toHaveBeenCalledWith({ confirmationModal: !confirmationModal });
        });
    });

    describe("#validateForm", () => {
        it("should call addError if there is error", () => {
            const errors = {
                terms: {
                    termLength: {
                        addError: jest.fn(),
                    },
                },
            };
            const formData = {
                terms: {
                    termLength: 10.2,
                },
            };
            wrapper.instance().validateForm(formData, errors);
            expect(errors.terms.termLength.addError).toHaveBeenCalledWith(
                "Term length value cannot have decimals",
            );
        });

        it("should not call addError if there is no error", () => {
            const errors = {
                terms: {
                    termLength: {
                        addError: jest.fn(),
                    },
                },
            };
            const formData = {
                terms: {
                    termLength: 10,
                },
            };
            wrapper.instance().validateForm(formData, errors);
            expect(errors.terms.termLength.addError).not.toHaveBeenCalled();
        });
    });
});
