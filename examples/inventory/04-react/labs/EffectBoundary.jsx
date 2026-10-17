import { Component } from "react";

export default class EffectBoundary extends Component {
  state = { message: null };
  static getDerivedStateFromError(error) { return { message: error.message }; }
  componentDidCatch() {}
  render() {
    return this.state.message ? <p role="alert">{this.state.message}</p> : this.props.children;
  }
}
