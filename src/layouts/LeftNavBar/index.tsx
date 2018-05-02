import * as React from "react";
import { IndexLink } from "react-router";
import { Wrapper, LogoContainer, BrandLogo, StyledLink } from "./styledComponents";
import { TradingPermissionsContainer } from "../../components";

class LeftNavBar extends React.Component {
    render() {
        return (
            <Wrapper>
                <LogoContainer>
                    <IndexLink to="/">
                        <BrandLogo src={require("../../assets/img/logo_icon_white.png")} />
                    </IndexLink>
                </LogoContainer>

                <StyledLink to="/dashboard" className="nav-link" activeClassName="active">
                    Dashboard
                </StyledLink>

                <StyledLink to="/request" className="nav-link" activeClassName="active">
                    Request Loan
                </StyledLink>

                <StyledLink to="/fill" className="nav-link" activeClassName="active">
                    Fill Loan
                </StyledLink>

                <TradingPermissionsContainer className="left" />
            </Wrapper>
        );
    }
}

export default LeftNavBar;
