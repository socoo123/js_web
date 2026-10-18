import { Component } from "react";

export default class ReportErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error, info) {
    console.error("报表区域失败", error, info.componentStack);
  }
  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}
