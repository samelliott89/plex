import * as React from "react";

import LeftNavBar from "../LeftNavBar";

import { Container, Drawer, Main, Footer, FooterLink, Layout } from "./styledComponents";

class PageLayout extends React.Component {
    render() {
        const leftLinkItems = [
            { url: "/dashboard", display: "DASHBOARD" },
            { url: "/request", display: "REQUEST LOAN" },
            { url: "/fill", display: "FILL LOAN" },
        ];

        return (
            <Container>
                <Layout>
                    <Drawer>
                        <LeftNavBar linkItems={leftLinkItems} />
                    </Drawer>
                    <Main>
                        {this.props.children}
                        <Footer>
                            <FooterLink to="/terms">Terms of Use</FooterLink>
                            <FooterLink to="/privacy">Privacy Policy</FooterLink>
                        </Footer>
                    </Main>
                </Layout>
            </Container>
        );
    }
}

export { PageLayout };
