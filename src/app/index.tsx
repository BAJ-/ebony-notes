import * as React from 'react';
import * as ReactDOM from 'react-dom';
//import { ipcRenderer } from 'electron';
import { Conductor } from './controllers/conductor';

import './styles.css';

class App extends React.PureComponent<Record<string, unknown>, { pianoConnected: boolean }> {
  private fgCanvas: HTMLCanvasElement | undefined;
  private bgCanvas: HTMLCanvasElement | undefined;

  constructor(props: Record<string, unknown>) {
    super(props);

    this.state = {
      pianoConnected: false
    }
  }

  private setFgCanvasRef = (canvas: HTMLCanvasElement) => {
    this.fgCanvas = canvas;
  }

  private setBgCanvasRef = (canvas: HTMLCanvasElement) => {
    this.bgCanvas = canvas;
  }

  componentDidMount() {
    new Conductor(window, this.fgCanvas, this.bgCanvas);
    //ipcRenderer.on('piano-connection', (_, options) => {
    //  this.setState({ pianoConnected: options.pianoConnected });
    //});
  }

  render(): JSX.Element {
    return (
      <>
        <canvas ref={this.setFgCanvasRef} width="1200" height="800" style={{position:"absolute"}} />
        <canvas ref={this.setBgCanvasRef} width="1200" height="800" style={{position:"absolute"}} />
      </>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
