import styled from "styled-components";
import { StyledButton } from "../StyledComponents";

export const TradingPermissionsWrapper = styled.div`
    width: inherit;
    &.left {
        position: fixed;
        bottom: 10px;
        padding-left: 25px;
    }
    @media only screen and (max-width: 823px) {
        &.left {
            bottom: 10px;
            padding: 0px 10px;
        }
    }
    @media only screen and (max-width: 568px) {
        &.left {
            bottom: 10px;
            padding: 0px 10px;
        }
    }
    @media only screen and (max-width: 480px) {
        width: 100%;
        &.left {
            display: none;
        }
    }
`;

export const TradingPermissionsTitle = styled.div`
    color: #ffffff;
    font-size: 13px;
    line-height: 25px;
    opacity: 0.5;
    padding: 5px 0px;
    text-transform: uppercase;

    @media only screen and (max-width: 823px) {
        font-size: 10px;
        line-height: 14px;
    }
    @media only screen and (max-width: 667px) {
        font-size: 8px;
        line-height: 12px;
    }
    @media only screen and (max-width: 568px) {
        font-size: 8px;
        line-height: 12px;
    }
    @media only screen and (max-width: 480px) {
        font-size: 10px;
        line-height: 10px;
    }
`;

export const TokenSearchResults = styled.div`
    min-height: 176px;
`;

export const TokenSymbol = styled.div`
    display: inline-block;
    min-width: 40px;
    padding-right: 5px;
    opacity: 0.5;

    @media only screen and (max-width: 823px) {
        min-width: 25px;
    }
`;

export const TokenBalance = styled.div`
    display: inline-block;
    opacity: 0.5;
`;

export const NoTokenResults = styled.div`
    color: #ffffff;
    opacity: 0.5;
`;

export const FaucetButton = StyledButton.extend`
    margin-left: 5px;
    display: inline-block;
    font-size: 10px !important;
    padding: 10px 15px !important;
    min-width: auto !important;
    line-height: 4px !important;

    @media only screen and (max-width: 823px) {
        font-size: 8px !important;
        padding: 2px 8px !important;
        min-width: auto !important;
        line-height: 12px !important;
    }
    @media only screen and (max-width: 667px) {
        font-size: 6px !important;
        padding: 0px 8px !important;
        min-width: auto !important;
        line-height: 12px !important;
    }
`;

export const ShowMoreButton = TradingPermissionsTitle.extend`
    cursor: pointer;
`;

export const Arrow = styled.img`
    width: 10px;
`;

export const LoaderContainer = styled.div`
    display: inline-block;
    margin-left: 10px;
`;
