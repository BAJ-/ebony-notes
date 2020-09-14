import * as React from 'react';
import { Route } from 'react-router-dom';

export class Routes extends React.PureComponent<unknown, unknown> {
  public render(): JSX.Element {
    return (
      <>
        <Route path="/" exact component={IndexView} />
        <Route path="/sheetmusic-practice" exact component={RandomNodeView} />
        <Route path="/scales" exact component={ScalesView} />
      </>
    );
  }
}

const ScalesView = () => <h1>Scales View</h1>
const RandomNodeView = () => <h1>Radom Node View</h1>
const IndexView = () => <h1>Index View</h1>