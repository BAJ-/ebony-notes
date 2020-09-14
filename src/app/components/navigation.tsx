import * as React from 'react';
import { Link } from 'react-router-dom';

export class Navigation extends React.PureComponent<unknown, unknown> {
  public render(): JSX.Element {
    return (
      <header>
        <nav className="flex items-center justify-between flex-wrap bg-purple-600 p-6">
          <ul className="flex text-gray-100">
            <li className="mr-6 hover:text-indigo-200"><Link to="/">Home</Link></li>
            <li className="mr-6 hover:text-indigo-200"><Link to="/sheetmusic-practice">Sheetmusic Practice</Link></li>
            <li className="mr-6 hover:text-indigo-200"><Link to="/scales">Scales Practice</Link></li>
          </ul>
        </nav>
      </header>
    );
  }
}