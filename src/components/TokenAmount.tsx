import * as React from "react";
import { BigNumber } from "bignumber.js";

interface Props {
    tokenAmount: BigNumber;
    tokenSymbol: string;
}

class TokenAmount extends React.Component<Props, {}> {
    render() {
        const { tokenAmount, tokenSymbol } = this.props;
        const humanReadableTokenAmount = this.formatAsHumanReadable(tokenAmount);

        return `${humanReadableTokenAmount} ${tokenSymbol}`;
    }

    private formatAsHumanReadable(value: BigNumber): string {
        if (!(value instanceof BigNumber)) {
            value = new BigNumber(value);
        }
        return value.div(new BigNumber(10 ** 18)).toString();
    }
}

export { TokenAmount };
