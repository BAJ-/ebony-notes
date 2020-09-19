import * as React from 'react';
import { Link } from 'react-router-dom';

export class ScalesView extends React.PureComponent<Record<string, unknown>, unknown> {
  constructor(props: Record<string, unknown>) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <div>
          <h1>Scales</h1>
          <Link to="/">Home</Link>
      </div>
    );
  }
}