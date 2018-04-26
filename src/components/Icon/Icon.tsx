// External Libraries
import * as React from "react";

export interface Props {
    icon: string;
    color?: string;
    height?: string;
    marginRight?: string;
    opacity?: number;
}

export default class Icon extends React.Component<Readonly<Props>, {}> {
    render() {
        const { icon, color, height, marginRight, opacity } = this.props;

        return (
            <i
                className={`fa fa-${icon}`}
                style={{
                    color,
                    marginRight,
                    lineHeight: height,
                    opacity,
                }}
            />
        );
    }
}
