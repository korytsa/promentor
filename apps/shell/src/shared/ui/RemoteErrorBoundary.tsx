import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; title: string };
type State = { hasError: boolean };

export class RemoteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="p-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {this.props.title}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Remote is unavailable right now. Try again later.
          </p>
        </section>
      );
    }

    return this.props.children;
  }
}
