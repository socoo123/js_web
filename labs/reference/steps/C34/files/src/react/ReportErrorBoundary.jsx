// region boundary
import React, { Component } from "react";
export default class ReportErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error, info) { console.error("报表区域失败", error, info.componentStack); }
  render() {
    if (this.state.failed) return <p role="alert">报表暂时无法显示。取消模拟故障后，收起再展开；代码下载失败时检查 Network 并刷新。</p>;
    return this.props.children;
  }
}
// endregion boundary
