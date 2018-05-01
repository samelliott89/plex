import * as React from "react";
// import TopNavBar from "../TopNavBar";
import LeftNavBar from "../LeftNavBar";
import {
    // Wrapper,
    Container,
    Drawer,
    Main,
    Footer,
    FooterLink,
    Layout,
} from "./styledComponents";

class PageLayout extends React.Component {
    render() {
        // const topLinkItems = [
        //     { url: "/plex", display: "PLEX" },
        //     { url: "/whitepaper", display: "WHITEPAPER" },
        //     { url: "/blog", display: "BLOG" },
        //     { url: "/github", display: "GITHUB" },
        //     { url: "/chat", display: "CHAT" },
        //     { url: "/twitter", display: "TWITTER" },
        //     { url: "/terms", display: "TERMS OF USE" },
        //     { url: "/privacy", display: "PRIVACY POLICY" },
        // ];

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
