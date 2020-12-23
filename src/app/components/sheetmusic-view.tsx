import { ipcRenderer } from 'electron';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { isEmpty, isEqual, xorWith } from 'lodash';
import { MusicSymbolDrawer } from '../utils/musical-symbol-drawer';
import { getRandomKey } from '../utils/tones';

interface SheetmusciViewProps {
  pianoConnected: boolean;
}

interface SheetMusicViewState {
  keysPressed: string[];
  max: string;
  min: string;
  currentNotes: string[];
  trebleClef: boolean;
  bassClef: boolean;
}

export class SheetmusicView extends React.PureComponent<SheetmusciViewProps, SheetMusicViewState> {
  private canvas: HTMLCanvasElement | undefined;
  private musicSymbolDrawer: MusicSymbolDrawer | undefined;

  private assertCanvas(canvas: unknown): asserts canvas is HTMLCanvasElement {
    if (canvas == null || !(canvas instanceof HTMLCanvasElement)) {
      throw new Error('Canvas was not found');
    }
  }

  constructor(props: SheetmusciViewProps) {
    super(props);

    this.state = {
      keysPressed: [],
      max: 'C 4',
      min: 'C 6',
      currentNotes: [],
      trebleClef: true,
      bassClef: false
    }
  }

  componentDidMount(): void {
    ipcRenderer.on('keys-pressed', (_, options) => {
      if (isEmpty(xorWith(this.state.currentNotes, options.keysPressed, isEqual))) {
        this.setState({
          currentNotes: [getRandomKey(this.state.max, this.state.min)]
        });
        this.musicSymbolDrawer?.draw({
          trebleClef: this.state.trebleClef,
          bassClef: this.state.bassClef,
          notes: this.state.currentNotes
        });
      }
      this.setState({
        keysPressed: options.keysPressed
      });

    });

    this.assertCanvas(this.canvas);
    this.musicSymbolDrawer = new MusicSymbolDrawer(
      this.canvas,
      window,
      {
        trebleClef: this.state.trebleClef,
        bassClef: this.state.bassClef,
        notes: this.state.currentNotes
      }
    );
  }

  private startPractice = () => {
    const randomNotes = [getRandomKey(this.state.max, this.state.min)];

    this.musicSymbolDrawer?.draw({
      trebleClef: this.state.trebleClef,
      bassClef: this.state.bassClef,
      notes: randomNotes
    });

    this.setState({
      currentNotes: randomNotes
    });
  }

  private setCanvasRef = (canvas: HTMLCanvasElement) => {
    this.canvas = canvas;
  }

  public render(): JSX.Element {
    return (
      <div>
          <h1>Sheetmusic</h1>
          <Link to="/">Home</Link>
          <button
            className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
            onClick={this.startPractice}>
            Start
          </button>
          <div className={this.props.pianoConnected ? '' : '' /*'pointer-events-none opacity-50'*/}>
            <canvas ref={this.setCanvasRef} width={800} height={500} className="border"/>
            <h1>Key pressed: {this.state.keysPressed.join(', ')}</h1>
          </div>
      </div>
    );
  }
}