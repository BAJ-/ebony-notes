import * as React from 'react';
import { Link } from 'react-router-dom';
import { ConnectionFloat } from './connection-float';

export class Navigation extends React.PureComponent<Record<string, unknown>, { showPianoConnector: boolean }> {
  constructor(props: Record<string, unknown>) {
    super(props);

    this.state = {
      showPianoConnector: false
    }
  }
  public render(): JSX.Element {
    return (
      <header>
        <nav className="flex items-center justify-between flex-wrap bg-purple-600 px-8 py-3">
          <ul className="flex text-gray-100">
            <li className="mr-6 hover:text-indigo-200"><Link to="/">Home</Link></li>
            <li className="mr-6 hover:text-indigo-200"><Link to="/sheetmusic-practice">Sheetmusic Practice</Link></li>
            <li className="mr-6 hover:text-indigo-200"><Link to="/scales">Scales Practice</Link></li>
            <li className="absolute right-0 top-0 mx-6 my-1 circle" onClick={()=> this.setState({showPianoConnector: !this.state.showPianoConnector})}></li>
          </ul>
        </nav>
        <ConnectionFloat visible={this.state.showPianoConnector} />
      </header>
    );
  }
}