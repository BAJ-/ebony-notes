import * as React from 'react';
import { Navigation } from './navigation';
import { Stage } from './stage';

export class Container extends React.PureComponent<unknown, unknown> {
  public render(): JSX.Element {
    return (
      <div className="text-gray-800">
        <Navigation />
        <Stage />
      </div>
    )
  }
}