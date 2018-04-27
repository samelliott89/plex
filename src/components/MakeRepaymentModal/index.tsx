import * as React from "react";
import { Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import Select from "react-select";
import "./style.css";
import { LoanSummary, LoanSummaryItem } from "./styledComponents";
import { BigNumber } from "bignumber.js";
import { ClipLoader } from "react-spinners";
import { shortenString } from "../../utils";
import { TokenAmount } from "../";

interface Props {
    modal: boolean;
    title: string;
    closeButtonText: string;
    submitButtonText: string;
    issuanceHash: string;
    totalExpectedRepaymentValue: BigNumber;
    amountAlreadyRepaid: BigNumber;
    principalTokenSymbol: string;
    awaitingTx: boolean;
    onToggle: () => void;
    onSubmit: (repaymentAmount: BigNumber, tokenSymbol: string) => void;
}

interface State {
    repaymentAmount: BigNumber;
    repaymentTokenSymbol: string;
}

class MakeRepaymentModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.onAmountChange = this.onAmountChange.bind(this);
        this.onTokenSymbolChange = this.onTokenSymbolChange.bind(this);

        this.handleToggle = this.handleToggle.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            repaymentAmount: new BigNumber(-1),
            repaymentTokenSymbol: props.principalTokenSymbol,
        };
    }

    onAmountChange(event: any) {
        if (event.target.value === "") {
            this.setState({ repaymentAmount: new BigNumber(-1) });
        } else {
            console.log(event.target.value);
            this.setState({ repaymentAmount: new BigNumber(event.target.value * 10 ** 18) });
        }
    }

    onTokenSymbolChange(choice: any) {
        if (choice) {
            this.setState({ repaymentTokenSymbol: choice.value });
        } else {
            this.setState({ repaymentTokenSymbol: "" });
        }
    }

    handleToggle() {
        this.props.onToggle();
    }

    handleSubmit() {
        this.props.onSubmit(this.state.repaymentAmount, this.state.repaymentTokenSymbol);
    }

    render() {
        const {
            issuanceHash,
            principalTokenSymbol,
            amountAlreadyRepaid,
            totalExpectedRepaymentValue,
        } = this.props;
        const { repaymentTokenSymbol } = this.state;

        return (
            <div>
                <Modal
                    isOpen={this.props.modal}
                    toggle={this.handleToggle}
                    keyboard={false}
                    backdrop={"static"}
                >
                    <ModalHeader toggle={this.handleToggle}>{this.props.title}</ModalHeader>
                    <ModalBody>
                        <LoanSummary>
                            You are making a repayment for debt agreement
                            <LoanSummaryItem> {shortenString(issuanceHash)}</LoanSummaryItem>. You
                            owe
                            <LoanSummaryItem>
                                {" "}
                                <TokenAmount
                                    tokenAmount={totalExpectedRepaymentValue}
                                    tokenSymbol={principalTokenSymbol}
                                />{" "}
                            </LoanSummaryItem>
                            in total, of which you've already repaid
                            <LoanSummaryItem>
                                {" "}
                                <TokenAmount
                                    tokenAmount={amountAlreadyRepaid}
                                    tokenSymbol={principalTokenSymbol}
                                />
                            </LoanSummaryItem>.
                        </LoanSummary>
                        <h4>
                            <b>
                                How large of a repayment would you like to make, and in what token?
                            </b>
                        </h4>
                        <div className="repayment-group">
                            <input
                                type="number"
                                className="form-control width65"
                                id="amount"
                                placeholder="Amount (e.g. 12.32)"
                                required={true}
                                disabled={false}
                                readOnly={false}
                                onChange={this.onAmountChange}
                            />
                            <Select
                                name="Token"
                                className="width35 make-repayment"
                                value={repaymentTokenSymbol}
                                options={[
                                    { value: "REP", label: "REP (Augur REP)" },
                                    { value: "MKR", label: "MKR (Maker DAO)" },
                                    { value: "ZRX", label: "ZRX (0x Protocol)" },
                                ]}
                                onChange={this.onTokenSymbolChange}
                                style={{ borderRadius: 0, borderColor: "#000000" }}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Row className="button-container">
                            <Col xs="12" md="6">
                                <Button
                                    className="button secondary width-95"
                                    onClick={this.handleToggle}
                                >
                                    {this.props.closeButtonText}
                                </Button>
                            </Col>
                            <Col xs="12" md="6" className="align-right">
                                <Button
                                    className="button width-95"
                                    disabled={this.props.awaitingTx}
                                    onClick={this.handleSubmit}
                                >
                                    {this.props.submitButtonText}
                                    <div className="loading-spinner">
                                        <ClipLoader
                                            size={12}
                                            color={"#ffffff"}
                                            loading={this.props.awaitingTx}
                                        />
                                    </div>
                                </Button>
                            </Col>
                        </Row>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export { MakeRepaymentModal };
