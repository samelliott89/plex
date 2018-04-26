import styled from "styled-components";
import { Row } from "reactstrap";
import { Link } from "react-router";

export const Wrapper = styled.div`
    height: 100%;
`;

export const StyledRow = styled(Row)`
    min-height: 100%;
    @media only screen and (max-width: 480px) {
        min-height: auto;
    }
`;

export const LeftContainer = styled.div`
    float: left;
    width: 213px;

    @media only screen and (max-width: 823px) {
        width: 160px;
    }
    @media only screen and (max-width: 667px) {
        width: 120px;
    }
    @media only screen and (max-width: 568px) {
        width: 120px;
    }
    @media only screen and (max-width: 480px) {
        width: 100%;
    }
`;

export const RightContainer = styled.div`
    float: left;
    width: -webkit-calc(100% - 213px) !important;
    width: -moz-calc(100% - 213px) !important;
    width: calc(100% - 213px) !important;
    min-height: 100%;
    position: relative;
    margin-left: 213px;

    @media only screen and (max-width: 823px) {
        margin-left: 160px;
        width: 663px !important;
    }
    @media only screen and (max-width: 812px) {
        width: 652px !important;
    }
    @media only screen and (max-width: 800px) {
        width: 640px !important;
    }
    @media only screen and (max-width: 768px) {
        width: 608px !important;
    }
    @media only screen and (max-width: 740px) {
        width: 580px !important;
    }
    @media only screen and (max-width: 720px) {
        width: 560px !important;
    }
    @media only screen and (max-width: 736px) {
        width: 576px !important;
    }
    @media only screen and (max-width: 731px) {
        width: 571px !important;
    }
    @media only screen and (max-width: 695px) {
        width: 535px !important;
    }
    @media only screen and (max-width: 690px) {
        width: 530px !important;
    }
    @media only screen and (max-width: 667px) {
        margin-left: 120px;
        width: 547px !important;
    }
    @media only screen and (max-width: 640px) {
        width: 520px !important;
    }
    @media only screen and (max-width: 604px) {
        width: 484px !important;
    }
    @media only screen and (max-width: 600px) {
        width: 480px !important;
    }
    @media only screen and (max-width: 598px) {
        width: 478px !important;
    }
    @media only screen and (max-width: 568px) {
        margin-left: 120px;
        width: 448px !important;
    }
    @media only screen and (max-width: 533px) {
        width: 413px !important;
    }
    @media only screen and (max-width: 504px) {
        width: 384px !important;
    }
    @media only screen and (max-width: 480px) {
        margin-left: 100%;
        width: 100% !important;
        min-height: auto;
    }
`;

export const Footer = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    text-align: right;
    height: 60px;

    @media only screen and (max-width: 823px) {
        height: 40px;
        padding: 5px;
    }
    @media only screen and (max-width: 568px) {
        height: 40px;
        padding: 5px;
    }
    @media only screen and (max-width: 480px) {
        display: none;
        height: 0;
    }
`;

export const FooterLink = styled(Link)`
    display: inline-block;
    margin: 0 10px;
    font-family: DIN-Bold;
    font-size: 13px;
    color: #002326;
    text-decoration: none;
    opacity: 0.5;

    &:hover {
        color: #002326;
        text-decoration: none;
    }

    @media only screen and (max-width: 823px) {
        margin: 0 8px;
        font-size: 11px;
    }
    @media only screen and (max-width: 568px) {
        margin: 0 5px;
        font-size: 8px;
    }
`;
