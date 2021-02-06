import { ipcRenderer } from 'electron';
import * as React from 'react';
import { isEmpty, isEqual, xorWith, first, includes } from 'lodash';
import { MusicSymbolDrawer } from '../utils/sheet-music-drawer';
import { getRandomKey } from '../utils/tones';

interface SheetmusciViewProps {
  pianoConnected: boolean;
}

interface SheetMusicViewState {
  keysPressed: string[];
  correctKeysPressed: boolean;
  startKey: string;
  endKey: string;
  practiceKeys: string[];
  trebleClef: boolean;
  bassClef: boolean;
  practicing: boolean;
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
      correctKeysPressed: false,
      startKey: 'C 4',
      endKey: 'C 6',
      practiceKeys: [],
      trebleClef: true,
      bassClef: false,
      practicing: false
    }
  }

  componentDidMount(): void {
    ipcRenderer.on('keys-pressed', (_, options) => {
      const { startKey, endKey, practicing, practiceKeys, correctKeysPressed } = this.state;
      let updatedStartKey = startKey;
      let updatedEndKey = endKey;
      let updatedCorrectKeysPressed = correctKeysPressed;

      if (!startKey || !endKey) {
         if (!startKey) {
           updatedStartKey = first(options.keysPressed);
         } else if (!endKey) {
           updatedEndKey = first(options.keysPressed);
         }
      } else if (isEmpty(xorWith(practiceKeys, options.keysPressed, isEqual)) && practicing && !correctKeysPressed) {
        updatedCorrectKeysPressed = true;
      }
      this.setState({
        correctKeysPressed: updatedCorrectKeysPressed,
        startKey: updatedStartKey,
        endKey: updatedEndKey,
        keysPressed: options.keysPressed
      });
    });
    
    ipcRenderer.on('key-released', (_, options) => {
      const { startKey, endKey, practicing, correctKeysPressed, practiceKeys, trebleClef, bassClef } = this.state;

      if (startKey && endKey && practicing && correctKeysPressed) {
        const updatedPracticeKeys = practiceKeys.filter(key => key !== options.keyReleased);

        if (isEmpty(updatedPracticeKeys)) {
          const newPracticeKey = (function getNewParcticeKey () {
            const randomKey = getRandomKey(endKey, startKey);
            return includes(practiceKeys, randomKey) ? getNewParcticeKey() : randomKey;
          })();
          this.setState({
            practiceKeys: [newPracticeKey],
            correctKeysPressed: false
          });
          this.musicSymbolDrawer?.draw({
            trebleClef: trebleClef,
            bassClef: bassClef,
            notes: this.state.practiceKeys
          }); 
        } else {
          this.setState({
            practiceKeys: updatedPracticeKeys
          });
        }
      }
    });

    this.assertCanvas(this.canvas);
    this.musicSymbolDrawer = new MusicSymbolDrawer(
      this.canvas,
      window,
      {
        trebleClef: this.state.trebleClef,
        bassClef: this.state.bassClef,
        notes: this.state.practiceKeys
      }
    );
  }

  private togglePractice = () => {
    const { practicing, trebleClef, bassClef, startKey, endKey } = this.state;

    if (practicing) {
      this.musicSymbolDrawer?.draw({
        trebleClef: trebleClef,
        bassClef: bassClef,
        notes: []
      });

      this.setState({ practicing: false });
    } else {
      const randomNotes = [getRandomKey(endKey, startKey)];

      this.musicSymbolDrawer?.draw({
        trebleClef: trebleClef,
        bassClef: bassClef,
        notes: randomNotes
      });

      this.setState({
        practicing: true,
        practiceKeys: randomNotes
      });
    }
  }

  private pickRange = () => {
    this.setState({ startKey: undefined, endKey: undefined });
  }

  private setCanvasRef = (canvas: HTMLCanvasElement) => {
    this.canvas = canvas;
  }

  private onClefChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let trebleClef = this.state.trebleClef;
    let bassClef = this.state.bassClef;
    if (e.target.id === 'treble-clef') {
      trebleClef = e.target.checked;
      this.setState({ trebleClef: trebleClef });
    } else if (e.target.id === 'bass-clef') {
      bassClef = e.target.checked;
      this.setState({ bassClef: bassClef });
    }
    this.musicSymbolDrawer?.draw({
      trebleClef:trebleClef,
      bassClef: bassClef,
      notes: []
    });
  }

  public render(): JSX.Element {
    const { startKey, endKey, practicing, keysPressed, trebleClef, bassClef, correctKeysPressed } = this.state;
    return (
      <div className="flex">
        <div className="flex-initial w-3/12 mr-10 border-r-2 border-gray-200">
          <div className="grid grid-cols-4 gap-4">
            <label className="flex justify-center items-center">
              <input type="checkbox" id="treble-clef" className="form-checkbox h-5 w-5 text-yellow-600 mr-2" onChange={this.onClefChange} checked={trebleClef}/>
              <span className="text-5xl align-middle">𝄞</span>
            </label>
            <label className="flex justify-center items-center">
              <input type="checkbox" id="bass-clef" className="form-checkbox h-5 w-5 text-yellow-600 mr-2" onChange={this.onClefChange} checked={bassClef} />
              <span className="text-3xl align-middle">𝄢</span>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <span>
              <span className={!startKey ? 'rounded-sm border-yellow-600' : ''}>{startKey || '?'}</span>:<span className={startKey && !endKey ? 'rounded-sm border-yellow-600' : ''}>{endKey || '?'}</span>
            </span>
            <button className="bg-transparent hover:bg-yellow-100 text-yellow-600" onClick={this.pickRange}>Range</button>
          </div>
        </div>
        <div>
          <button className="bg-transparent hover:bg-yellow-100 text-yellow-600" onClick={this.togglePractice}>{practicing ? 'Stop Practice' : 'Start Practice'}</button>
        </div>
        <div className="flex-1">
          <div className={this.props.pianoConnected ? '' : '' /*'pointer-events-none opacity-50'*/}>
            <h1 className={correctKeysPressed ? 'text-green-600 text-xl' : 'text-xl'}>Key pressed: {keysPressed.join(', ')}</h1>
            <canvas ref={this.setCanvasRef} width={800} height={500} />
          </div>
        </div>
      </div>
    );
  }
}