import { ipcRenderer } from 'electron';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { MusicSymbolDrawer } from '../utils/musical-symbol-drawer';

interface PlanAndSeeViewProps {
  pianoConnected: boolean;
}
interface PlanAndSeeViewState {
  keysPressed: string[];
  bassClef: boolean;
  trebleClef: boolean;
}
export class PlayAndSeeView extends React.PureComponent<PlanAndSeeViewProps, PlanAndSeeViewState> {
  private canvas: HTMLCanvasElement | undefined;
  private musicSymbolDrawer: MusicSymbolDrawer | undefined;

  private assertCanvas(canvas: unknown): asserts canvas is HTMLCanvasElement {
    if (canvas == null || !(canvas instanceof HTMLCanvasElement)) {
      throw new Error('Canvas was not found');
    }
  }

  constructor(props: PlanAndSeeViewProps) {
    super(props);

    this.state = {
      keysPressed: [],
      bassClef: false,
      trebleClef: true
    }
  }

  componentDidMount(): void {
    ipcRenderer.on('keys-pressed', (_, options) => {
      this.setState({ keysPressed: options.keysPressed });
      this.musicSymbolDrawer?.draw({
        bassClef: this.state.bassClef,
        trebleClef: this.state.trebleClef,
        notes: this.state.keysPressed
      });
    });

    this.assertCanvas(this.canvas);
    this.musicSymbolDrawer = new MusicSymbolDrawer(
      this.canvas,
      window,
      {
        bassClef: this.state.bassClef,
        trebleClef: this.state.trebleClef
      }
    );
  }

  componentDidUpdate(): void {
    this.musicSymbolDrawer?.draw({
      trebleClef: this.state.trebleClef,
      bassClef: this.state.bassClef,
      notes: this.state.keysPressed
    });
  }

  private setCanvasRef = (canvas: HTMLCanvasElement) => {
    this.canvas = canvas;
  }

  onClefChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      bassClef: e.currentTarget.value === 'bassClef',
      trebleClef: e.currentTarget.value === 'trebleClef'
    })
  }

  public render(): JSX.Element {
    return (
      <div>
          <h1>Play and see</h1>
          <Link to="/">Home</Link>
          <div>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="trebleClefButton"
                className="form-radio"
                value="trebleClef"
                checked={this.state.trebleClef}
                onChange={this.onClefChange} />
              <span className="ml-2">Treble Clef</span>
            </label>
            <label className="inline-flex items-center ml-6">
              <input
                type="radio"
                name="bassClefButton"
                className="form-radio"
                value="bassClef"
                checked={this.state.bassClef}
                onChange={this.onClefChange} />
              <span className="ml-2">Bass Clef</span>
            </label>
          </div>
          <div className={this.props.pianoConnected ? '' : '' /*'pointer-events-none opacity-50'*/}>
            <canvas ref={this.setCanvasRef} width={800} height={500} className="border"/>
            <h1>Key pressed: {this.state.keysPressed.join(', ')}</h1>
          </div>
      </div>
    );
  }
}