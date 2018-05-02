import * as React from "react";
import { IndexLink } from "react-router";
import {
    Wrapper,
    LogoContainer,
    BrandLogo,
    StyledLink,
} from "./styledComponents";
import { TradingPermissionsContainer } from "../../components";

interface LinkItem {
    url: string;
    display: string;
}

interface Props {
    linkItems: LinkItem[];
}

class LeftNavBar extends React.Component<Props, {}> {
    render() {
        const { linkItems } = this.props;

        return (
            <Wrapper>
                <LogoContainer>
                    <IndexLink to="/">
                        <BrandLogo src={require("../../assets/img/logo_icon_white.png")} />
                    </IndexLink>
                </LogoContainer>

                {
                    linkItems.map((link) => (
                        <StyledLink key={link.display} to={link.url} className="nav-link" activeClassName="active">
                            {link.display}
                        </StyledLink>
                    ))
                }
                <TradingPermissionsContainer className="left" />
            </Wrapper>
        );
    }
}

export default LeftNavBar;
