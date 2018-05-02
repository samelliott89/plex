import * as React from "react";

import LeftNavBar from "../LeftNavBar";

import { Container, Drawer, Main, Footer, FooterLink, Layout } from "./styledComponents";

interface State {
    screenWidth: number;
}

class PageLayout extends React.Component<{}, State> {
    constructor(props: Object) {
        super(props);

        this.state = { screenWidth: 0 };
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ screenWidth: window.innerWidth });
    }

    render() {
        const { screenWidth } = this.state;
        const hasDrawer = screenWidth > 1025;

        return (
            <Container>
                <Layout className={hasDrawer ? "has-drawer" : ""}>
                    <Drawer className="Drawer">
                        <LeftNavBar />
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
