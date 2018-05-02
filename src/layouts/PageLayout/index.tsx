// External libraries
import * as React from "react";

// Components
import Icon from "../../components/Icon/Icon";
import LeftNavBar from "../LeftNavBar";

// Styled components
import {
    Container,
    Drawer,
    DrawerButton,
    Main,
    Footer,
    FooterLink,
    Layout,
    LayoutObfuscator,
    Header
} from "./styledComponents";

interface State {
    screenWidth: number;
    drawerVisible: boolean;
}

/**
 * The number of pixels, below which the layout responds
 * to a mobile-friendly view.
 *
 * Currently set to the size of an iPad.
 *
 * @type {number}
 */
const LAYOUT_BREAK_POINT = 768;

class PageLayout extends React.Component<{}, State> {
    constructor(props: Object) {
        super(props);

        this.state = { screenWidth: 0, drawerVisible: false };
        
        this.handleOpenDrawer = this.handleOpenDrawer.bind(this);
        this.handleCloseDrawer = this.handleCloseDrawer.bind(this);

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ screenWidth: window.innerWidth });
    }

    handleOpenDrawer() {
        this.setState({ drawerVisible: true });
    }

    handleCloseDrawer() {
        this.setState({ drawerVisible: false });
    }

    render() {
        const { screenWidth, drawerVisible } = this.state;
        const hasDrawer = screenWidth > LAYOUT_BREAK_POINT;

        return (
            <Container>
                <Layout className={hasDrawer ? "has-drawer" : ""}>
                    <Header className="Header">
                        <DrawerButton role="button" onClick={this.handleOpenDrawer}>
                            <Icon icon="bars"/>
                        </DrawerButton>
                    </Header>

                    <Drawer className={`Drawer ${drawerVisible ? "is-visible" : ""}`}>
                        <LeftNavBar />
                    </Drawer>

                    <Main className="Main">
                        {this.props.children}

                        <Footer>
                            <FooterLink to="/terms">Terms of Use</FooterLink>
                            <FooterLink to="/privacy">Privacy Policy</FooterLink>
                        </Footer>
                    </Main>

                    <LayoutObfuscator
                        className={drawerVisible ? "is-visible" : ""}
                        onClick={this.handleCloseDrawer}
                    />
                </Layout>
            </Container>
        );
    }
}

export { PageLayout };
