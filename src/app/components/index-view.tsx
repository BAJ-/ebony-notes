import * as React from 'react';
import { Link } from 'react-router-dom';

export class IndexView extends React.PureComponent<Record<string, unknown>, unknown> {
  constructor(props: Record<string, unknown>) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <div className="p-12">
        <div className="flex justify-between">
          <Link to="/sheetmusic-practice" className="w-1/4 h-64 rounded overflow-hidden shadow-lg" title="Sheetmusic">
          </Link>
          <Link to="/scale-practice" className=" w-1/4 h-64 rounded overflow-hidden shadow-lg" title="Scales">
          </Link>
          <Link to="/play-and-see" className="w-1/4 h-64 rounded overflow-hidden shadow-lg" title="Play and see">
          </Link>
        </div>
      </div>
    );
  }
}