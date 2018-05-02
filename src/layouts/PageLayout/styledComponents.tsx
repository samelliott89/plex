import styled from "styled-components";
import { Link } from "react-router";

export const Container = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
`;

export const Layout = styled.div`
    width: 100%;
    height: 100%;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    -webkit-overflow-scrolling: touch;
`;

export const Header = styled.div``;

export const Drawer = styled.div`
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-flex-wrap: nowrap;
    -ms-flex-wrap: nowrap;
    flex-wrap: nowrap;
    width: 240px;
    height: 100%;
    max-height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
        0 1px 5px 0 rgba(0, 0, 0, 0.12);
    box-sizing: border-box;
    border-right: 1px solid #e0e0e0;
    background: #fafafa;
    color: #424242;
    overflow: visible;
    overflow-y: auto;
    z-index: 5;
    
    @media (max-width: 1025px) {
        // display: none;
    }
`;

export const Main = styled.div`
    background-color: #f5f5f5 !important;
    margin-left: 240px;

    -ms-flex: 0 1 auto;
    position: relative;
    display: inline-block;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-flex-grow: 1;
    -ms-flex-positive: 1;
    flex-grow: 1;
    z-index: 1;
    -webkit-overflow-scrolling: touch;
    
    @media (max-width: 1025px) {
        margin-left: 0;
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
