import * as React from 'react';
import { Link } from 'react-router-dom';
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
      <div className="text-gray-700">
        <header className="inline-block bg-gray-900 w-full">
          <div className="inline-block float-left"><Link to="/">Home</Link></div>
          <div className="inline-block float-right w-16 h-16 mt-3 mb-3 mr-3 rounded-full bg-yellow-100">
          </div>
        </header>
        <Stage pianoConnected={pianoConnected} />
      </div>
    )
  }
}