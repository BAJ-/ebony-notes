import * as React from 'react';
import { Link } from 'react-router-dom';

export class Navigation extends React.PureComponent<unknown, unknown> {
  public render(): JSX.Element {
    return (
      <header>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/sheetmusic-practice">Sheetmusic Practice</Link></li>
            <li><Link to="/scales">Scales Practice</Link></li>
          </ul>
        </nav>
      </header>
    );
  }
}