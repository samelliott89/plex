import * as React from "react";
import { shallow } from "enzyme";
import { ActiveDebtOrder } from "src/modules/Dashboard/Debts/ActiveDebtOrder/ActiveDebtOrder";
import {
    Wrapper,
    ImageContainer,
    IdenticonImage,
    DetailContainer,
    Amount,
    Url,
    StatusActive,
    StatusPending,
    Terms,
    RepaymentScheduleContainer,
    Title,
    Schedule,
    ScheduleIconContainer,
    Strikethrough,
    PaymentDate,
    ShowMore,
    DetailLink,
    Drawer,
    InfoItem,
    InfoItemTitle,
    InfoItemContent,
    ActionButton,
    PendingActionContainer,
    CancelButton,
} from "src/modules/Dashboard/Debts/ActiveDebtOrder/styledComponents";
import { Collapse } from "reactstrap";
import {
    formatDate,
    formatTime,
    getIdenticonImgSrc,
    shortenString,
    amortizationUnitToFrequency,
} from "src/utils";
import { BigNumber } from "bignumber.js";
import MockDharma from "__mocks__/dharma.js";
import { TokenAmount } from "src/components";
import { ScheduleIcon } from "src/components/scheduleIcon/scheduleIcon";

describe("<ActiveDebtOrder />", () => {
    const debtOrder = {
        debtor: "0x431194c3e0f35bc7f1266ec6bb85e0c5ec554935",
        termsContract: "0x1c907384489d939400fa5c6571d8aad778213d74",
        termsContractParameters:
            "0x0000000000000000000000000000008500000000000000000000000000000064",
        underwriter: "0x0000000000000000000000000000000000000000",
        underwriterRiskRating: new BigNumber(0),
        amortizationUnit: "hours",
        interestRate: new BigNumber(3.12),
        principalAmount: new BigNumber(100),
        principalTokenSymbol: "REP",
        termLength: new BigNumber(6),
        issuanceHash: "0x89e9eac37c5f14b657c69ccd891704b3236b84b9ca1d449bd09c5fbaa24afebf",
        repaidAmount: new BigNumber(4),
        repaymentSchedule: [1553557371],
        status: "active",
        json:
            '{"principalToken":"0x9b62bd396837417ce319e2e5c8845a5a960010ea","principalAmount":"10","termsContract":"0x1c907384489d939400fa5c6571d8aad778213d74","termsContractParameters":"0x0000000000000000000000000000008500000000000000000000000000000064","kernelVersion":"0x89c5b853e9e32bf47c7da1ccb02e981b74c47f2f","issuanceVersion":"0x1d8e76d2022e017c6c276b44cb2e4c71bd3cc3de","debtor":"0x431194c3e0f35bc7f1266ec6bb85e0c5ec554935","debtorFee":"0","creditor":"0x431194c3e0f35bc7f1266ec6bb85e0c5ec554935","creditorFee":"0","relayer":"0x0000000000000000000000000000000000000000","relayerFee":"0","underwriter":"0x0000000000000000000000000000000000000000","underwriterFee":"0","underwriterRiskRating":"0","expirationTimestampInSec":"1524613355","salt":"0","debtorSignature":{"v":27,"r":"0xc5c0aaf7b812cb865aef48958e2d39686a13c292f8bd4a82d7b43d833fb5047d","s":"0x2fbbe9f0b8e12ed2875905740fa010bbe710c3e0c131f1efe14fb41bb7921788"},"creditorSignature":{"v":27,"r":"0xc5c0aaf7b812cb865aef48958e2d39686a13c292f8bd4a82d7b43d833fb5047d","s":"0x2fbbe9f0b8e12ed2875905740fa010bbe710c3e0c131f1efe14fb41bb7921788"},"underwriterSignature":{"r":"","s":"","v":0}}',
        creditor: "0x431194c3e0f35bc7f1266ec6bb85e0c5ec554935",
        description: "Hello, Can I borrow some REP please?",
        fillLoanShortUrl: "http://bit.ly/2I4bahM",
    };

    describe("#render", () => {
        let wrapper;
        let props;
        beforeEach(() => {
            props = {
                currentTime: 12345,
                debtOrder,
                dharma: new MockDharma(),
                accounts: [],
                handleSuccessfulRepayment: jest.fn(),
                handleSetErrorToast: jest.fn(),
                handleSetSuccessToast: jest.fn(),
                handleCancelDebtOrder: jest.fn(),
            };
            wrapper = shallow(<ActiveDebtOrder {...props} />);
        });

        it("should render successfully", () => {
            expect(wrapper.length).toEqual(1);
        });

        it("should not render when there is no debtOrder", () => {
            wrapper.setProps({ debtOrder: null });
            expect(wrapper.find(Wrapper).length).toEqual(0);
        });

        describe("<ImageContainer />", () => {
            it("should render", () => {
                expect(wrapper.find(ImageContainer).length).toEqual(1);
            });

            it("should render a <IdenticonImage />", () => {
                const identiconImgSrc = getIdenticonImgSrc(props.debtOrder.issuanceHash, 60, 0.1);
                expect(wrapper.find(ImageContainer).find(IdenticonImage).length).toEqual(1);
                expect(
                    wrapper
                        .find(ImageContainer)
                        .find(IdenticonImage)
                        .prop("src"),
                ).toEqual(identiconImgSrc);
            });
        });

        describe("<DetailContainer />", () => {
            let detailContainer;
            beforeEach(() => {
                detailContainer = wrapper.find(DetailContainer);
            });

            it("should render", () => {
                expect(detailContainer.length).toEqual(1);
            });

            it("should render correct <Amount />", () => {
                expect(detailContainer.find(Amount).length).toEqual(1);
                expect(
                    detailContainer
                        .find(Amount)
                        .find(TokenAmount)
                        .prop("tokenAmount"),
                ).toEqual(props.debtOrder.principalAmount);
                expect(
                    detailContainer
                        .find(Amount)
                        .find(TokenAmount)
                        .prop("tokenSymbol"),
                ).toEqual(props.debtOrder.principalTokenSymbol);
            });

            describe("<Url />", () => {
                it("should render correct <Url /> when status is active", () => {
                    props.debtOrder.status = "active";
                    wrapper.setProps({ debtOrder: props.debtOrder });
                    detailContainer = wrapper.find(DetailContainer);
                    expect(detailContainer.find(Url).length).toEqual(1);
                    expect(detailContainer.find(Url).get(0).props.children).toEqual(
                        shortenString(props.debtOrder.issuanceHash),
                    );
                });
            });

            it("should render a Make Repayment button if status active and collateral is not returnable", () => {
                props.debtOrder.status = "active";
                wrapper.setProps({ debtOrder: props.debtOrder });
                detailContainer = wrapper.find(DetailContainer);
                expect(detailContainer.find(ActionButton).length).toEqual(1);
                expect(
                    detailContainer
                        .find(ActionButton)
                        .first()
                        .props().children,
                ).toEqual("Make Repayment");
            });

            it("should render <StatusActive /> if active", () => {
                expect(detailContainer.find(StatusActive).length).toEqual(1);
            });

            it("should render a <Terms />", () => {
                expect(detailContainer.find(Terms).length).toEqual(1);
            });
        });

        describe("<RepaymentScheduleContainer />", () => {
            it("should render", () => {
                props.debtOrder.status = "active";
                wrapper.setProps({ props });
                expect(wrapper.find(RepaymentScheduleContainer).length).toEqual(1);
            });

            it("should render a <Title />", () => {
                expect(wrapper.find(RepaymentScheduleContainer).find(Title).length).toEqual(1);
            });

            describe("<Schedule />", () => {
                it("should render", () => {
                    expect(wrapper.find(Schedule).length).toEqual(1);
                });

                it("should render a <ScheduleContainer />", () => {
                    expect(
                        wrapper
                            .find(Schedule)
                            .first()
                            .find(ScheduleIconContainer).length,
                    ).toEqual(1);
                });

                it("should render <ScheduleIcon />", () => {
                    props.debtOrder.repaymentSchedule = [0];
                    wrapper.setProps({ debtOrder: props.debtOrder });
                    expect(
                        wrapper
                            .find(Schedule)
                            .first()
                            .find(ScheduleIconContainer)
                            .find(ScheduleIcon).length,
                    ).toEqual(1);
                });

                it("should render time in <PaymentDate />", () => {
                    props.debtOrder.amortizationUnit = "hours";
                    props.debtOrder.repaymentSchedule = [2553557371];
                    wrapper.setProps({ debtOrder: props.debtOrder });
                    const expectedValue = formatTime(2553557371);
                    expect(
                        wrapper
                            .find(Schedule)
                            .first()
                            .find(PaymentDate).length,
                    ).toEqual(1);
                    expect(
                        wrapper
                            .find(Schedule)
                            .first()
                            .find(PaymentDate)
                            .get(0).props.children,
                    ).toEqual(expectedValue);
                });

                it("should render date in <PaymentDate />", () => {
                    props.debtOrder.amortizationUnit = "days";
                    wrapper.setProps({ debtOrder: props.debtOrder });
                    const expectedValue = formatDate(2553557371);
                    expect(
                        wrapper
                            .find(Schedule)
                            .first()
                            .find(PaymentDate).length,
                    ).toEqual(1);
                    expect(
                        wrapper
                            .find(Schedule)
                            .first()
                            .find(PaymentDate)
                            .get(0).props.children,
                    ).toEqual(expectedValue);
                });

                it("last <Schedule /> should render <ShowMore /> when there is more than 5 repayment schedules", () => {
                    props.debtOrder.repaymentSchedule = [
                        1553557371,
                        1553657371,
                        1553757371,
                        1553857371,
                        1553957371,
                        1554 - 57371,
                    ];
                    wrapper.setProps({ debtOrder: props.debtOrder });
                    expect(
                        wrapper
                            .find(Schedule)
                            .last()
                            .find(ShowMore).length,
                    ).toEqual(1);
                });
            });

            describe("#status pending", () => {
                let detailContainer;

                beforeAll(() => {
                    props.debtOrder.status = "pending";
                    wrapper.setProps({ debtOrder: props.debtOrder });
                    detailContainer = wrapper.find(DetailContainer);
                });

                it("should render correct <Url />", () => {
                    expect(detailContainer.find(Url).find(DetailLink).length).toEqual(1);
                    expect(
                        detailContainer
                            .find(Url)
                            .find(DetailLink)
                            .prop("to"),
                    ).toEqual("/request/success/" + props.debtOrder.issuanceHash);
                    expect(
                        detailContainer
                            .find(Url)
                            .find(DetailLink)
                            .get(0).props.children,
                    ).toEqual(shortenString(props.debtOrder.issuanceHash));
                });

                it("should not render a <MakeRepaymentButton />", () => {
                    props.debtOrder.status = "pending";
                    wrapper.setProps({ props });
                    detailContainer = wrapper.find(DetailContainer);
                    expect(detailContainer.find(ActionButton).length).toEqual(0);
                });

                it("should render <StatusPending />", () => {
                    expect(detailContainer.find(StatusPending).length).toEqual(1);
                });

                it("should render <CancelButton />", () => {
                    expect(wrapper.find(PendingActionContainer).find(CancelButton).length).toEqual(
                        1,
                    );
                });

                it("should not render <RepaymentScheduleContainer />", () => {
                    expect(wrapper.find(RepaymentScheduleContainer).length).toEqual(0);
                });
            });
        });

        describe("<Collapse />", () => {
            let collapse;
            beforeEach(() => {
                collapse = wrapper.find(Collapse);
            });

            it("should render", () => {
                expect(collapse.length).toEqual(1);
            });

            it("should render 6 <InfoItem />", () => {
                expect(collapse.find(InfoItem).length).toEqual(6);
            });

            it("1st <InfoItem /> should render Requested info", () => {
                const elm = collapse.find(InfoItem).at(0);
                expect(elm.find(InfoItemTitle).get(0).props.children).toEqual("Requested");
                expect(
                    elm
                        .find(InfoItemContent)
                        .find(TokenAmount)
                        .prop("tokenAmount"),
                ).toEqual(props.debtOrder.principalAmount);
                expect(
                    elm
                        .find(InfoItemContent)
                        .find(TokenAmount)
                        .prop("tokenSymbol"),
                ).toEqual(props.debtOrder.principalTokenSymbol);
            });

            it("2nd <InfoItem /> should render Repaid info", () => {
                const elm = collapse.find(InfoItem).at(1);
                expect(elm.find(InfoItemTitle).get(0).props.children).toEqual("Repaid");
                expect(
                    elm
                        .find(InfoItemContent)
                        .find(TokenAmount)
                        .prop("tokenAmount"),
                ).toEqual(props.debtOrder.repaidAmount);
                expect(
                    elm
                        .find(InfoItemContent)
                        .find(TokenAmount)
                        .prop("tokenSymbol"),
                ).toEqual(props.debtOrder.principalTokenSymbol);
            });

            it("3rd <InfoItem /> should render Term Length info", () => {
                const elm = collapse.find(InfoItem).at(2);
                expect(elm.find(InfoItemTitle).get(0).props.children).toEqual("Term Length");
                const content =
                    props.debtOrder.termLength.toNumber() + " " + props.debtOrder.amortizationUnit;
                expect(elm.find(InfoItemContent).get(0).props.children).toEqual(content);
            });

            it("4th <InfoItem /> should render Interest Rate info", () => {
                const elm = collapse.find(InfoItem).at(3);
                expect(elm.find(InfoItemTitle).get(0).props.children).toEqual("Interest Rate");
                const content = props.debtOrder.interestRate.toNumber() + "%";
                expect(elm.find(InfoItemContent).get(0).props.children).toEqual(content);
            });

            it("5th <InfoItem /> should render Installment Frequency info", () => {
                const elm = collapse.find(InfoItem).at(4);
                expect(elm.find(InfoItemTitle).get(0).props.children).toEqual(
                    "Installment Frequency",
                );
                const content = amortizationUnitToFrequency(props.debtOrder.amortizationUnit);
                expect(elm.find(InfoItemContent).get(0).props.children).toEqual(content);
            });

            it("6th <InfoItem /> should render Description info", () => {
                const elm = collapse.find(InfoItem).at(5);
                expect(elm.find(InfoItemTitle).get(0).props.children).toEqual("Description");
                const content = props.debtOrder.description;
                expect(elm.find(InfoItemContent).get(0).props.children).toEqual(content);
            });
        });
    });

    describe("#onClick Wrapper", () => {
        it("should call toggleDrawer on click", () => {
            const props = { debtOrder, dharma: new MockDharma(), currentTime: 12345 };
            const spy = jest.spyOn(ActiveDebtOrder.prototype, "toggleDrawer");
            const wrapper = shallow(<ActiveDebtOrder {...props} />);
            wrapper.simulate("click");
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });

        it("toggleDrawer should call setState", () => {
            const props = { debtOrder, dharma: new MockDharma(), currentTime: 12345 };
            const spy = jest.spyOn(ActiveDebtOrder.prototype, "setState");
            const wrapper = shallow(<ActiveDebtOrder {...props} />);
            const collapse = wrapper.state("collapse");
            wrapper.simulate("click");
            expect(spy).toHaveBeenCalledWith({ collapse: !collapse });
            spy.mockRestore();
        });
    });

    describe("#onClick <MakeRepaymentButton />", () => {
        it("should call makeRepayment", () => {
            debtOrder.status = "active";
            const props = { debtOrder, dharma: new MockDharma(), currentTime: 12345 };
            const spy = jest.spyOn(ActiveDebtOrder.prototype, "handleMakeRepaymentClick");
            const wrapper = shallow(<ActiveDebtOrder {...props} />);
            const event = {
                stopPropagation: jest.fn(),
            };
            wrapper.find(ActionButton).simulate("click", event);
            expect(spy).toHaveBeenCalledWith(event);
            spy.mockRestore();
        });
    });
});
