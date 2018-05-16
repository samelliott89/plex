jest.unmock("@dharmaprotocol/dharma.js");

import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { FillLoanEntered } from 'src/modules/FillLoan/FillLoanEntered/FillLoanEntered';
import { FillLoanEnteredContainer } from 'src/modules/FillLoan/FillLoanEntered/FillLoanEnteredContainer';
import { PaperLayout } from 'src/layouts';
import {
	Header,
	ConfirmationModal,
	MainWrapper
} from 'src/components';
import { Col } from 'reactstrap';
import { SuccessModal } from 'src/modules/FillLoan/FillLoanEntered/SuccessModal';
import {
	LoanInfoContainer,
	HalfCol,
	InfoItem,
	Title,
	Content,
	ButtonContainer,
	DeclineButton,
	FillLoanButton
} from 'src/modules/FillLoan/FillLoanEntered/styledComponents';
import MockWeb3 from '__mocks__/web3';
import MockDharma from '__mocks__/dharma.js';
import { BigNumber } from 'bignumber.js';
import { Link, browserHistory } from 'react-router';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { fillDebtEntity } from 'src/modules/FillLoan/FillLoanEntered/actions';
import { DebtKernel } from '@dharmaprotocol/contracts';
import { Types } from '@dharmaprotocol/dharma.js';
import { debtOrderFromJSON } from 'src/utils';
const compact = require('lodash.compact');
const ABIDecoder = require('abi-decoder');
ABIDecoder.addABI(DebtKernel.abi);
import { BarLoader } from "react-spinners";

describe('<FillLoanEntered />', () => {
	let web3;
	let dharma;
	let props;
	let query;
	beforeEach(() => {
		web3 = new MockWeb3();
		dharma = new MockDharma();
		query = {
			collateralAmount: 10,
			collateralToken: "0x07e93e27ac8a1c114f1931f65e3c8b5186b9b77e",
			collateralTokenSymbol: 'MKR',
			creditor: '0x431194c3e0f35bc7f1266ec6bb85e0c5ec554935',
			creditorFee: 0,
			creditorSignature: '{"v":27,"r":"0xc5c0aaf7b812cb865aef48958e2d39686a13c292f8bd4a82d7b43d833fb5047d","s":"0x2fbbe9f0b8e12ed2875905740fa010bbe710c3e0c131f1efe14fb41bb7921788"}',
			debtor: '0x431194c3e0f35bc7f1266ec6bb85e0c5ec554935',
			debtorFee: 0,
			debtorSignature: '{"v":27,"r":"0xc5c0aaf7b812cb865aef48958e2d39686a13c292f8bd4a82d7b43d833fb5047d","s":"0x2fbbe9f0b8e12ed2875905740fa010bbe710c3e0c131f1efe14fb41bb7921788"}',
			description: 'Hello, Can I borrow some MKR please?',
			expirationTimestampInSec: 1524613355,
			gracePeriodInDays: 1,
			interestRate: 5,
			issuanceVersion: '0x1d8e76d2022e017c6c276b44cb2e4c71bd3cc3de',
			kernelVersion: '0x89c5b853e9e32bf47c7da1ccb02e981b74c47f2f',
			principalAmount: 10,
			principalToken: '0x07e93e27ac8a1c114f1931f65e3c8b5186b9b77e',
			principalTokenSymbol: 'MKR',
			relayer: '0x0000000000000000000000000000000000000000',
			relayerFee: 0,
			salt: 0,
			termsContract: '0x1c907384489d939400fa5c6571d8aad778213d74',
			termsContractParameters: '0x0000000000000000000000000000008500000000000000000000000000000064',
			termLength: 12,
			underwriter: '0x0000000000000000000000000000000000000000',
			underwriterFee: 0,
			underwriterRiskRating: 0,
			underwriterSignature: '{"r":"","s":"","v":0}',
		};

		props = {
			location: {
				query
			},
			web3,
			accounts: ['0x431194c3e0f35bc7f1266ec6bb85e0c5ec554935'],
			dharma,
			tokens: [],
			handleSetError: jest.fn(),
			handleFillDebtEntity: jest.fn(),
			updateTokenBalance: jest.fn()
		};
	});

	describe('#render', () => {
		let wrapper;
		beforeEach(() => {
			wrapper = shallow(<FillLoanEntered {... props} />);
		});

		it('should render successfully', () => {
			expect(wrapper.length).toEqual(1);
		});
	});

	describe('#componentDidMount', () => {
		it('should call getDebtEntityDetail', async () => {
			const spy = jest.spyOn(FillLoanEntered.prototype, 'getDebtEntityDetail');
			const wrapper = shallow(<FillLoanEntered {... props} />);
			await expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});
	});

	describe('#componentDidUpdate', () => {
		it('should call getDebtEntityDetail', async () => {
			props.location.query = null;
			props.dharma = null;
			const spy = jest.spyOn(FillLoanEntered.prototype, 'getDebtEntityDetail');
			const wrapper = shallow(<FillLoanEntered {... props} />);
			props.location.query = query;
			props.dharma = dharma;
			wrapper.setProps(props);
			expect(spy).toHaveBeenCalledWith(props.dharma);
			spy.mockRestore();
		});
	});

	describe('#confirmationModalToggle', () => {
		it('should call setState', () => {
			const spy = jest.spyOn(FillLoanEntered.prototype, 'setState');
			const wrapper = shallow(<FillLoanEntered {... props} />);
			const confirmationModal = wrapper.state('confirmationModal');
			wrapper.instance().confirmationModalToggle();
			expect(spy).toHaveBeenCalledWith({ confirmationModal: !confirmationModal });
			spy.mockRestore();
		});
	});

	describe('#successModalToggle', () => {
		it('should call setState', () => {
			const spy = jest.spyOn(FillLoanEntered.prototype, 'setState');
			const wrapper = shallow(<FillLoanEntered {... props} />);
			const successModal = wrapper.state('successModal');
			wrapper.instance().successModalToggle();
			expect(spy).toHaveBeenCalledWith({ confirmationModal: false, successModal: !successModal });
			spy.mockRestore();
		});
	});

	describe('#getDebtEntityDetail', () => {
		it('calls setState', async () => {
			const wrapper = shallow(<FillLoanEntered {... props} />);
			const spy = jest.spyOn(wrapper.instance(), 'setState');
			await wrapper.instance().getDebtEntityDetail(props.dharma, props.location.query);
			await expect(spy).toHaveBeenCalled();
			const expectedDebtEntity = debtOrderFromJSON(JSON.stringify(props.location.query));
			const { description, principalTokenSymbol, ...filteredQuery } = props.location.query;
			expectedDebtEntity.dharmaOrder = debtOrderFromJSON(JSON.stringify(filteredQuery));
			const expectedDescription = description;
			const expectedPrincipalTokenAmount = new Types.TokenAmount({
                symbol: principalTokenSymbol,
                amount: new BigNumber(props.location.query.principalAmount),
                type: Types.TokenAmountType.Raw,
            });

			expect(wrapper.state('debtEntity')).toEqual(expectedDebtEntity);
			expect(wrapper.state('description')).toEqual(expectedDescription);
			expect(wrapper.state('principalTokenAmount')).toEqual(expectedPrincipalTokenAmount);
			spy.mockRestore();
		});
	});

	describe('#handleFillOrder', () => {
		describe('no error', () => {
			let debtEntity;
			beforeEach(() => {
				debtEntity = debtOrderFromJSON(JSON.stringify(props.location.query));
				delete(debtEntity.description);
				delete(debtEntity.principalTokenSymbol);
				ABIDecoder.decodeLogs = jest.fn((logs) => [{name: 'LogDebtOrderFilled'}]);
			});

			afterEach(() => {
				ABIDecoder.decodeLogs.mockRestore();
			});

			it('should call props handleSetError', async () => {
				const wrapper = shallow(<FillLoanEntered {... props} />);
				await wrapper.instance().handleFillOrder();
				await expect(props.handleSetError).toHaveBeenCalledWith('');
			});

			it('calls Dharma#fillAsync', async () => {
				const wrapper = shallow(<FillLoanEntered {... props} />);
				await wrapper.instance().handleFillOrder();
				await expect(dharma.order.fillAsync).toHaveBeenCalledWith(debtEntity, {from: props.accounts[0], gasPrice: undefined});
			});

			it('calls Dharma#awaitTransactionMinedAsync', async () => {
				const wrapper = shallow(<FillLoanEntered {... props} />);
				await wrapper.instance().handleFillOrder();
				const expectedTxHash = await dharma.order.fillAsync(debtEntity);
				await expect(dharma.blockchain.awaitTransactionMinedAsync).toHaveBeenCalledWith(expectedTxHash, 1000, 60000);
			});

			it('calls Dharma#getErrorLogs', async () => {
				const wrapper = shallow(<FillLoanEntered {... props} />);
				await wrapper.instance().handleFillOrder();
				const expectedTxHash = await dharma.order.fillAsync(debtEntity);
				const expectedErrorLogs = await dharma.blockchain.getErrorLogs(expectedTxHash);
				await expect(dharma.blockchain.getErrorLogs).toHaveBeenCalledWith(expectedTxHash);
			});

			it('calls props handleFillDebtEntity', async () => {
				const wrapper = shallow(<FillLoanEntered {... props} />);
				await wrapper.instance().handleFillOrder();
				await expect(props.handleFillDebtEntity).toHaveBeenCalled();
			});

			it('calls successModalToggle', async () => {
				const spy = jest.spyOn(FillLoanEntered.prototype, 'successModalToggle');
				const wrapper = shallow(<FillLoanEntered {... props} />);
				await wrapper.instance().handleFillOrder();
				await expect(spy).toHaveBeenCalled();
			});
		});

		describe('#ABIDecoder.decodeLogs does\'t return LogDebtOrderFilled event', () => {
			it('should call props.handleSetError', async () => {
				ABIDecoder.decodeLogs = jest.fn((logs) => [{name: ''}]);
				const wrapper = shallow(<FillLoanEntered {... props} />);
				await wrapper.instance().handleFillOrder();
				await expect(props.handleSetError).toHaveBeenCalled();
				ABIDecoder.decodeLogs.mockRestore();
			});
		});

		describe('#getErrorLogs has error', () => {
			it('should call props.handleSetError', async () => {
				dharma.blockchain.getErrorLogs = jest.fn( async(txHash) => ['Some error message']);
				const wrapper = shallow(<FillLoanEntered {... props} />);
				await wrapper.instance().handleFillOrder();
				await expect(props.handleSetError).toHaveBeenCalled();
				await expect(props.handleFillDebtEntity).not.toHaveBeenCalled();
				dharma.blockchain.getErrorLogs.mockRestore();
			});
		});

		describe('#throw error', () => {
			it('should call props.handleSetError', async () => {
				dharma.order.fillAsync = jest.fn( async(debtEntity, txData) => throw new Error('error'); );
				const wrapper = shallow(<FillLoanEntered {... props} />);
				await wrapper.instance().handleFillOrder();
				await expect(props.handleSetError).toHaveBeenCalled();
				dharma.order.fillAsync.mockRestore();
			});
		});
	});

	describe('#handleRedirect', () => {
		it('should call browserHistory', () => {
			const spy = jest.spyOn(browserHistory, 'push');
			const wrapper = shallow(<FillLoanEntered {... props} />);
			wrapper.instance().handleRedirect();
			expect(spy).toHaveBeenCalledWith('/dashboard');
		});
	});
});
