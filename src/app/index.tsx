import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { Container } from './components/container';
import { ipcRenderer } from 'electron';

import './styles.css';

class App extends React.PureComponent<Record<string, unknown>, { pianoConnected: boolean }> {
  constructor(props: Record<string, unknown>) {
    super(props);

    this.state = {
      pianoConnected: false
    }
  }

  componentDidMount() {
    ipcRenderer.on('piano-connection', (_, options) => {
      console.log(`piano connection: ${options.pianoConnected}`)
      this.setState({ pianoConnected: options.pianoConnected });
    });
  }

  render(): JSX.Element {
    return (
      <HashRouter>
        <Container pianoConnected={this.state.pianoConnected} />
      </HashRouter>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));