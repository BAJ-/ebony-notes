import * as React from 'react';
import { Route } from 'react-router-dom';
import { PlayAndSeeView } from './play-and-see';
import { IndexView } from './index-view';
import { SheetmusicView } from './sheetmusic-view';

interface RoutesProps {
  pianoConnected: boolean;
}

export class Routes extends React.PureComponent<RoutesProps, unknown> {
  constructor(props: RoutesProps) {
    super(props);
  }

  public render(): JSX.Element {
    const { pianoConnected } = this.props;
    return (
      <>
        <Route path="/" exact component={IndexView} />
        <Route path="/sheetmusic-practice" exact>
          <SheetmusicView pianoConnected={pianoConnected} />
        </Route>
        <Route path="/play-and-see" exact>
          <PlayAndSeeView pianoConnected={pianoConnected} />
        </Route>
      </>
    );
  }
}