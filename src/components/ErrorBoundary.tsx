import { Component, type ReactNode } from 'react';
import { Button } from '@/components/Button';

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main
        className="mx-auto mt-[10vh] max-w-[560px] rounded-[20px] border border-outline bg-surface p-[32px] text-foreground"
        role="alert"
      >
        <h1 className="text-[24px] font-medium">This page couldn’t be displayed</h1>
        <p className="my-[20px] text-muted">
          Reload to return to your workspace. Your saved posts will be kept.
        </p>
        <Button onClick={() => window.location.reload()}>Reload workspace</Button>
      </main>
    );
  }
}
