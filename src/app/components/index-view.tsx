import * as React from 'react';
import { Link } from 'react-router-dom';

export class IndexView extends React.PureComponent<unknown, unknown> {
  constructor(props: unknown) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <div className="p-16">
        <div className="flex justify-between">
          <Link to="/sheetmusic-practice" className="h-64 w-2/5 rounded overflow-hidden shadow-lg" title="Sheetmusic">
          </Link>
          <Link to="/play-and-see" className="h-64 w-2/5 rounded overflow-hidden shadow-lg" title="Play and see">
          </Link>
        </div>
      </div>
    );
  }
}