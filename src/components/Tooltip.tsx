import * as React from "react";
import * as ReactTooltip from "react-tooltip";

interface Props {
    content: JSX.Element;
    id: string;
}

class Tooltip extends React.Component<Props, {}> {
    render() {
        const { content, id } = this.props;
        return (
            <span>
                <i className="fa fa-question-circle" data-tip={true} data-for={id} />
                <ReactTooltip place="top" type="dark" effect="float" id={id}>
                    <span>{content}</span>
                </ReactTooltip>
            </span>
        );
    }
}

export { Tooltip };
