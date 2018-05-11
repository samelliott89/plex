import * as React from "react";
import Dharma from "@dharmaprotocol/dharma.js";
import { PaperLayout } from "../../../layouts";
import { Header, ScrollToTopOnMount, MainWrapper } from "../../../components";
import { ShareRequestURL } from "./ShareRequestURL";
import { RequestLoanSummary } from "./RequestLoanSummary";
import { DebtEntity, OpenCollateralizedDebtEntity } from "../../../models";
import { debtOrderFromJSON } from "../../../utils";

interface RequestLoanSuccessProps {
    debtEntity: OpenCollateralizedDebtEntity;
    dharma: Dharma;
    updateDebtEntity: (debtEntity: DebtEntity) => void;
    setPendingDebtEntity: (issuanceHash: string) => void;
    location: {
        query: object;
    };
}

interface States {
    email: string;
}

class RequestLoanSuccess extends React.Component<RequestLoanSuccessProps, States> {
    constructor(props: RequestLoanSuccessProps) {
        super(props);
        this.state = {
            email: "",
        };
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleGetNotified = this.handleGetNotified.bind(this);
        this.handleShareSocial = this.handleShareSocial.bind(this);
    }

    async componentDidMount() {
        // In the case that this page is navigated to directly, the loan order will not
        // yet be loaded in the redux store.  In that case, we should pull the loan order
        // from dharma.js.

        if (!this.props.debtEntity && this.props.location) {
            const urlParams = this.props.location.query;
            if (!urlParams) {
                return;
            }

            const debtEntity: OpenCollateralizedDebtEntity = debtOrderFromJSON(
                JSON.stringify(urlParams),
            );

            this.props.updateDebtEntity(debtEntity);
            this.props.setPendingDebtEntity(debtEntity.issuanceHash);
        }
    }

    handleEmailChange(email: string) {
        this.setState({ email: email });
    }

    handleGetNotified() {
        console.log("Get Notified", this.state);
    }

    handleShareSocial(socialMediaName: string) {
        const { debtEntity } = this.props;

        if (!debtEntity) {
            return;
        }

        const { fillLoanShortUrl, description, principalAmount, principalTokenSymbol } = debtEntity;
        let text;
        let windowProps;
        let url;

        if (!fillLoanShortUrl) {
            return;
        }

        const encodedUrl = encodeURIComponent(fillLoanShortUrl);

        text = `I'd like to borrow ${principalAmount} ${principalTokenSymbol}`;

        if (description) {
            text += ` for ${description}`;
        }

        switch (socialMediaName) {
            case "twitter":
                url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`;
                windowProps =
                    "left=0,top=0,width=550,height=450,personalbar=0,toolbar=0,scrollbars=0,resizable=0";
                window.open(url, "", windowProps);
                break;
            case "facebook":
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                windowProps =
                    "left=0,top=0,width=600,height=250,personalbar=0,toolbar=0,scrollbars=0,resizable=0";
                window.open(url, "", windowProps);
                break;
            default:
        }
    }

    render() {
        let { debtEntity, dharma } = this.props;
        const urlParams = this.props.location.query;

        if (!debtEntity) {
            return null;
        }

        const descriptionContent = (
            <span>
                Get lenders to fill your loan request by directing them to your request URL.
            </span>
        );
        return (
            <PaperLayout>
                <MainWrapper>
                    <ScrollToTopOnMount />
                    <Header
                        title={"Next, share your loan request with lenders"}
                        description={descriptionContent}
                    />
                    <ShareRequestURL
                        issuanceHash={debtEntity.issuanceHash}
                        shortUrl={debtEntity.fillLoanShortUrl || ""}
                        onShareSocial={this.handleShareSocial}
                    />
                    <RequestLoanSummary
                        debtEntity={debtEntity}
                        dharma={dharma}
                        urlParams={urlParams}
                    />
                </MainWrapper>
            </PaperLayout>
        );
    }
}

export { RequestLoanSuccess };
