import styled from "styled-components";
import { Link } from "react-router";

export const Wrapper = styled.div`
    background-color: #082c30;
    width: inherit;
    position: fixed;
    top: 0px;
    left: 0;
    bottom: 0;
    box-shadow: 0 12px 24px 0 rgba(0, 0, 0, 0.35);
`;

export const LogoContainer = styled.div`
    margin: 40px 0 50px;
    text-align: center;
`;

export const BrandLogo = styled.img`
    width: 35px;
`;

export const StyledLink = styled(Link)`
    font-family: DIN, sans-serif;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 14px;
    color: #ffffff;
    line-height: 25px;
    opacity: 0.5;
    padding: 20px 25px !important;

    &:hover,
    &.active {
        color: #ffffff;
        background-color: rgba(255, 255, 255, 0.08);
        border-left: 5px solid #f3764b;
        opacity: 1;
        padding: 20px 25px 20px 20px !important;
    }
`;
