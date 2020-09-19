import * as React from 'react';
import { Routes } from './routes';

interface StageProps {
  pianoConnected: boolean;
}

export class Stage extends React.PureComponent<StageProps, unknown> {
  constructor(props: StageProps) {
    super(props);
  }

  public render(): JSX.Element {
    const { pianoConnected } = this.props;

    return (
      <div className="pt-6 pr-8 pl-8">
        <Routes pianoConnected={pianoConnected} />
      </div>
    )
  }
}