import * as React from "react";
import Dharma from "@dharmaprotocol/dharma.js";
import { Row, Col, Label } from "reactstrap";
import { BigNumber } from "bignumber.js";
import { DebtOrderEntity } from "../../../../models";
import {
    amortizationUnitToFrequency,
    debtOrderFromJSON,
    normalizeDebtOrder,
} from "../../../../utils";
import {
    Wrapper,
    StyledLabel,
    GrayContainer,
    InfoItem,
    Title,
    Content,
    SummaryJsonContainer,
    TextareaContainer,
    StyledTextarea,
    CopyButton,
    CopiedMessage,
} from "./styledComponents";
import { TokenAmount } from "src/components";

interface Props {
    debtOrder: DebtOrderEntity;
    dharma: Dharma;
}

interface State {
    collateralTokenDecimals?: BigNumber;
    copied: boolean;
    principalTokenDecimals: BigNumber;
}

class RequestLoanSummary extends React.Component<Props, State> {
    private summaryTextarea: HTMLTextAreaElement;

    constructor(props: Props) {
        super(props);
        this.state = {
            copied: false,
            principalTokenDecimals: new BigNumber(0),
        };
        this.handleCopyClipboard = this.handleCopyClipboard.bind(this);
        this.setTokenDecimals = this.setTokenDecimals.bind(this);
    }

    async componentDidMount() {
        this.setTokenDecimals();
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.dharma !== prevProps.dharma) {
            this.setTokenDecimals();
        }
    }

    async setTokenDecimals() {
        const { debtOrder, dharma } = this.props;

        if (!dharma) {
            return;
        }

        const collateralTokenSymbol = debtOrder.collateralTokenSymbol;
        const principalTokenSymbol = debtOrder.principalTokenSymbol;

        let collateralTokenDecimals;

        if (collateralTokenSymbol) {
            collateralTokenDecimals = await dharma.token.getNumDecimals(collateralTokenSymbol);
        }
        const principalTokenDecimals = await dharma.token.getNumDecimals(principalTokenSymbol);

        this.setState({
            collateralTokenDecimals,
            principalTokenDecimals,
        });
    }

    handleCopyClipboard() {
        this.summaryTextarea!.select();
        document.execCommand("copy");
        this.summaryTextarea!.focus();
        this.setState({ copied: true });
    }

    render() {
        const { debtOrder } = this.props;
        const { collateralTokenDecimals, principalTokenDecimals } = this.state;

        if (!debtOrder.json || (debtOrder.collateralized && !collateralTokenDecimals)) {
            return null;
        }
        const debtOrderInfo = debtOrderFromJSON(debtOrder.json);
        const summaryJSON = {
            ...debtOrderInfo,
            description: debtOrder.description,
            principalTokenSymbol: debtOrder.principalTokenSymbol,
        };
        const termLength = `${debtOrder.termLength.toNumber()} ${debtOrder.amortizationUnit}`;
        const interestRate = `${debtOrder.interestRate.toNumber()}%`;
        const installmentFrequency = amortizationUnitToFrequency(debtOrder.amortizationUnit);

        const collateral =
            debtOrder.collateralized && collateralTokenDecimals ? (
                <InfoItem>
                    <Title>Collateral</Title>
                    <Content>
                        <TokenAmount
                            tokenAmount={debtOrder.collateralAmount!}
                            tokenDecimals={collateralTokenDecimals}
                            tokenSymbol={debtOrder.collateralTokenSymbol!}
                        />
                    </Content>
                </InfoItem>
            ) : null;
        const gracePeriod = debtOrder.collateralized ? (
            <InfoItem>
                <Title>Grace Period</Title>
                <Content>
                    {debtOrder.gracePeriodInDays} {"days"}
                </Content>
            </InfoItem>
        ) : null;

        return (
            <Wrapper>
                <StyledLabel>Loan request summary</StyledLabel>
                <GrayContainer>
                    <Row>
                        <Col xs="6" md="6">
                            <InfoItem>
                                <Title>Principal</Title>
                                <Content>
                                    <TokenAmount
                                        tokenAmount={debtOrder.principalAmount}
                                        tokenDecimals={principalTokenDecimals}
                                        tokenSymbol={debtOrder.principalTokenSymbol}
                                    />
                                </Content>
                            </InfoItem>
                            <InfoItem>
                                <Title>Term Length</Title>
                                <Content>{termLength}</Content>
                            </InfoItem>
                            {collateral}
                        </Col>
                        <Col xs="6" md="6">
                            <InfoItem>
                                <Title>Interest Rate</Title>
                                <Content>{interestRate}</Content>
                            </InfoItem>
                            <InfoItem>
                                <Title>Installment Frequency</Title>
                                <Content>{installmentFrequency}</Content>
                            </InfoItem>
                            {gracePeriod}
                        </Col>
                        <Col xs="12">
                            <InfoItem>
                                <Title>Description</Title>
                                <Content>{debtOrder.description}</Content>
                            </InfoItem>
                        </Col>
                    </Row>
                    <SummaryJsonContainer>
                        <Label>JSON</Label>
                        <TextareaContainer>
                            <StyledTextarea
                                value={JSON.stringify(normalizeDebtOrder(summaryJSON))}
                                readOnly={true}
                                innerRef={(textarea: HTMLTextAreaElement) => {
                                    this.summaryTextarea = textarea;
                                }}
                            />
                            <CopyButton onClick={this.handleCopyClipboard}>Copy</CopyButton>
                        </TextareaContainer>
                        <CopiedMessage>{this.state.copied ? "Copied!" : ""}</CopiedMessage>
                    </SummaryJsonContainer>
                </GrayContainer>
            </Wrapper>
        );
    }
}

export { RequestLoanSummary };
