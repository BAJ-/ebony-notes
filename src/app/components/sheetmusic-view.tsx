import { ipcRenderer } from 'electron';
import * as React from 'react';
import { isEmpty, first, find, cloneDeep, includes } from 'lodash';
import { MusicSymbolDrawer, Note } from '../utils/sheet-music-drawer';
import { getRandomKey } from '../utils/tones';

export interface KeyRanges {
  treble: {
    start: string;
    end: string;
  };
  bass: {
    start: string;
    end: string;
  };
}

interface SheetmusciViewProps {
  pianoConnected: boolean;
}

interface SheetMusicViewState {
  keysPressed: string[];
  correctKeysPressed: boolean;
  keyRanges: KeyRanges;
  practiceKeys: Note[];
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
      keyRanges: {
        treble: {
          start: 'C 4',
          end: 'C 5',
        },
        bass: {
          start: 'C 3',
          end: 'C 4',
        },
      },
      practiceKeys: [],
      trebleClef: true,
      bassClef: false,
      practicing: false
    }
  }

  componentDidMount(): void {
    ipcRenderer.on('keys-pressed', (_, options) => {
      const {
        keyRanges, practicing, practiceKeys, correctKeysPressed
      } = this.state;

      const keyRangesSet = keyRanges.treble.start && keyRanges.treble.end && keyRanges.bass.start && keyRanges.bass.end;
      let updatedCorrectKeysPressed = correctKeysPressed;
      const updatedKeyRanges = cloneDeep(keyRanges);

      if (!keyRangesSet) {
         if (!keyRanges.treble.start) {
           updatedKeyRanges.treble.start = first(options.keysPressed);
         } else if (!keyRanges.treble.end) {
           updatedKeyRanges.treble.end = first(options.keysPressed);
         } else if (!keyRanges.bass.start) {
            updatedKeyRanges.bass.start = first(options.keysPressed);
         } else if (!keyRanges.bass.end) {
           updatedKeyRanges.bass.end = first(options.keysPressed);
         }
      } else if (practicing && !correctKeysPressed) {
        const keyMatch = find(practiceKeys, (note: Note) => includes(options.keysPressed, note.key));
        updatedCorrectKeysPressed = keyMatch != null;
      }
      this.setState({
        correctKeysPressed: updatedCorrectKeysPressed,
        keyRanges: updatedKeyRanges,
        keysPressed: options.keysPressed
      });
    });
    
    ipcRenderer.on('key-released', (_, options) => {
      const {
        keyRanges, practicing, correctKeysPressed, practiceKeys, trebleClef, bassClef
      } = this.state;

      const rangeKeysSet = keyRanges.treble.start && keyRanges.treble.end && keyRanges.bass.start && keyRanges.bass.end;

      if (rangeKeysSet && practicing && correctKeysPressed) {
        const updatedPracticeKeys = practiceKeys.filter(note => note.key !== options.keyReleased);

        if (isEmpty(updatedPracticeKeys)) {
          const newPracticeKey: Note = (function getNewPracticeKey () {
            const randomKey = getRandomKey(keyRanges, trebleClef, bassClef);
            return find(practiceKeys, (k) => k.key === randomKey.key && k.clef === randomKey.clef) ? getNewPracticeKey() : randomKey;
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
    const { practicing, trebleClef, bassClef, keyRanges } = this.state;

    if (practicing) {
      this.musicSymbolDrawer?.draw({
        trebleClef: trebleClef,
        bassClef: bassClef,
        notes: []
      });

      this.setState({ practicing: false });
    } else {
      const randomNotes = [getRandomKey(keyRanges, trebleClef, bassClef)];

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

  private pickTrebleRange = () => {
    const keyRanges = Object.assign({}, this.state.keyRanges, { treble: { start: undefined, end: undefined } });
    this.setState({ keyRanges: keyRanges });
  }

  private pickBassRange = () => {
    const keyRanges = Object.assign({}, this.state.keyRanges, { bass: { start: undefined, end: undefined } });
    this.setState({ keyRanges: keyRanges });
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
    const { keyRanges, practicing, keysPressed, trebleClef, bassClef, correctKeysPressed } = this.state;
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
              <span className={!keyRanges.treble.start ? 'rounded-sm border-yellow-600' : ''}>{keyRanges.treble.start || '?'}</span>:<span className={keyRanges.treble.start && !keyRanges.treble.end ? 'rounded-sm border-yellow-600' : ''}>{keyRanges.treble.end || '?'}</span>
            </span>
            <button className="bg-transparent hover:bg-yellow-100 text-yellow-600" onClick={this.pickTrebleRange}><span className="text-5xl align-middle">𝄞</span> range</button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <span>
              <span className={!keyRanges.bass.start ? 'rounded-sm border-yellow-600' : ''}>{keyRanges.bass.start || '?'}</span>:<span className={keyRanges.bass.start && !keyRanges.bass.end ? 'rounded-sm border-yellow-600' : ''}>{keyRanges.bass.end || '?'}</span>
            </span>
            <button className="bg-transparent hover:bg-yellow-100 text-yellow-600" onClick={this.pickBassRange}><span className="text-5xl align-middle">𝄢</span> range</button>
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