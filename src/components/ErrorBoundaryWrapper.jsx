import React, { Component } from "react";
import { bindAll } from "lodash";

import Page500 from "./errorPages/Page500";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };

    bindAll(this, "onRedirect");
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  onRedirect() {
    /**
     * added delay because this state updates before redirect
     * and the same component that thrown error may render again
     *  */
    setTimeout(() => {
      this.setState({
        hasError: false,
      });
    }, 50);
  }
  render() {
    const { children } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      return <Page500 onRedirect={this.onRedirect} />;
    }

    return children;
  }
}

export default ErrorBoundary;
