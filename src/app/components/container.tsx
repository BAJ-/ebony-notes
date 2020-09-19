import * as React from 'react';
import { Stage } from './stage';

interface ContainerProps {
  pianoConnected: boolean;
}

export class Container extends React.PureComponent<ContainerProps, unknown> {
  constructor(props: ContainerProps) {
    super(props);
  }

  public render(): JSX.Element {
    const { pianoConnected } = this.props;
    return (
      <div className="text-gray-800">
        <header>
          <div className="inline-block w-full pr-8 pl-8 pt-3 pb-3 bg-gray-500 text-gray-100">
            <div className={`float-right ${pianoConnected ? 'text-green-300' : 'text-red-300'}`}>Piano</div>
          </div>
        </header>
        <Stage pianoConnected={pianoConnected} />
      </div>
    )
  }
}