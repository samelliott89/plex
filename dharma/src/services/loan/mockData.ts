import { LoanEntity } from '../../models';

export const loans: LoanEntity[] =
[
	{
		id: 'asdfGH',
		amount: '10',
		currency: 'ETH',
		collateralized: true,
		collateralSource: 'SNT',
		collateralAmount: '15',
		collateralCurrency: 'BTC',
		collateralLockupPeriod: 'custom',
		collateralCustomLockupPeriod: 6,
		terms: 'simple',
		installments: true,
		active: true,
		paid: false,
		createdOnTimestamp: 1514764800,
		paidOnTimestamp: 0
	},
	{
		id: 'Iihwdko',
		amount: '3',
		currency: 'BTC',
		collateralized: true,
		collateralSource: 'ADA',
		collateralAmount: '20',
		collateralCurrency: 'ETH',
		collateralLockupPeriod: '1week',
		collateralCustomLockupPeriod: 0,
		terms: 'compound',
		installments: false,
		active: true,
		paid: false,
		createdOnTimestamp: 1517961600,
		paidOnTimestamp: 0
	},
	{
		id: 'OWJceb',
		amount: '5',
		currency: 'ETH',
		collateralized: true,
		collateralSource: 'REP',
		collateralAmount: '100',
		collateralCurrency: 'BTC',
		collateralLockupPeriod: 'custom',
		collateralCustomLockupPeriod: 10,
		terms: 'simple',
		installments: true,
		active: true,
		paid: false,
		createdOnTimestamp: 1515974400,
		paidOnTimestamp: 0
	},
	{
		id: 'owek9n',
		amount: '10',
		currency: 'ETH',
		collateralized: true,
		collateralSource: 'SNT',
		collateralAmount: '15',
		collateralCurrency: 'BTC',
		collateralLockupPeriod: 'custom',
		collateralCustomLockupPeriod: 6,
		terms: 'simple',
		installments: true,
		active: false,
		paid: true,
		createdOnTimestamp: 1511827200,
		paidOnTimestamp: 1517097600
	},
	{
		id: 'kqjYlk',
		amount: '3',
		currency: 'BTC',
		collateralized: true,
		collateralSource: 'ADA',
		collateralAmount: '20',
		collateralCurrency: 'ETH',
		collateralLockupPeriod: '1week',
		collateralCustomLockupPeriod: 0,
		terms: 'compound',
		installments: false,
		active: false,
		paid: true,
		createdOnTimestamp: 1515628800,
		paidOnTimestamp: 1516320000
	}
];