import { Component } from "react";
import { PageState } from "../shared/components/ui";

export default class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, pathname: props.pathname };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  static getDerivedStateFromProps(props, state) {
    return props.pathname !== state.pathname
      ? { pathname: props.pathname, error: null }
      : null;
  }
  componentDidCatch(error, info) {
    console.error("Unable to render route", error, info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <PageState
          error
          title="Unable to load page"
          message="This page couldn't be loaded. Please refresh your browser to try again."
        />
      );
    }

    return this.props.children;
  }
}
