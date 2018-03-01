import * as React from 'react';
import { PaperLayout } from '../../layouts';
import { MainWrapper, Checkbox } from '../../components';
import { Error as ErrorComponent } from '../../components/Error/Error';
import {
	BannerContainer,
	Header,
	Description,
	ButtonContainer,
	NextButton
} from './styledComponents';
import { Link, browserHistory } from 'react-router';

interface State {
	agreeToTermsOfUse: boolean;
	errorMessage: string;
}

class Welcome extends React.Component<{}, State> {
	constructor(props: {}) {
		super(props);
		this.state = {
			agreeToTermsOfUse: false,
			errorMessage: ''
		};
		this.handleAgreeChange = this.handleAgreeChange.bind(this);
		this.checkAgree = this.checkAgree.bind(this);
	}

	handleAgreeChange(checked: boolean) {
		this.setState({
			agreeToTermsOfUse: checked
		});
	}

	checkAgree() {
		this.setState({ errorMessage: '' });
		if (!this.state.agreeToTermsOfUse) {
			this.setState({ errorMessage: 'You have to agree to the terms of use to continue' });
			return;
		}
		browserHistory.push('/request');
	}

	render() {
		const checkboxLabel = (
			<span>
				I have read and agree to the <Link to="/terms">Terms of Use</Link>.
			</span>
		);
		return (
			<PaperLayout>
				<ErrorComponent errorMessage={this.state.errorMessage} />
				<BannerContainer />
				<MainWrapper>
					<Header>Welcome to Dharma Bazaar</Header>
					<Description>
						The Dharma Protocol enables users to interact on the Ethereum blockchain using tokenized debt agreements. However, Dharma Labs Inc. is not a party to any contract entered into between users of the Dharma Protocol, does not act as a lender or give loans using the Dharma Protocol, and does not otherwise enter into any agreements with or commit to any obligations to any user of the Dharma Protocol. Further, you acknowledge that the Dharma Protocol is in beta form, may have limited functionality, and may contain errors.
					</Description>
					<Checkbox name="agree" label={checkboxLabel} onChange={this.handleAgreeChange} checked={this.state.agreeToTermsOfUse} />
					<ButtonContainer>
						<NextButton onClick={this.checkAgree}>Next &rarr;</NextButton>
					</ButtonContainer>
				</MainWrapper>
			</PaperLayout>
		);
	}
}

export { Welcome };
