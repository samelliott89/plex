import * as React from "react";
import * as ReactTooltip from "react-tooltip";

class Tooltip extends React.Component<{}, {}> {
    render() {
        return (
            <span>
                <i className="fa fa-question-circle" data-tip="React-tooltip" />
                <ReactTooltip place="top" type="dark" effect="float" />
            </span>
        );
    }
}

export { Tooltip };
