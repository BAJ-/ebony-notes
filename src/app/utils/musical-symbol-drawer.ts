import { KeyNote } from "../../data/midi-hex-table";

interface OptionProps {
  xPadding: number;
  yPadding: number;
}

interface Note extends KeyNote {
  color?: string;
  value?: 'sixteenth' | 'eighth' | 'quarter' | 'half' | 'whole';
  dot?: boolean;
  tie?: boolean;
}

export interface SymbolState {
  trebleClef?: boolean;
  bassClef?: boolean;
  keySignatures?: []
  timeSignature?: string;
  notes?: Note[];
}

interface ExtendedCanvasRenderingContext2D extends CanvasRenderingContext2D {
  webkitBackingStorePixelRatio?: number;
}

type Tones = {
  'A': number;
  'B': number;
  'C': number;
  'D': number;
  'E': number;
  'F': number;
  'G': number;
}

export class MusicSymbolDrawer {
  private canvas: HTMLCanvasElement;
  private context: ExtendedCanvasRenderingContext2D;
  private options: OptionProps;

  protected lineWidth = 2.4;
  protected barWidth = 6;
  protected inactiveAlpha = 0.2;

  protected toneSpacing = 9.5;
  protected lineSpacing = 2 * this.toneSpacing;
  protected linesInStaf = 5;
  protected linesBetweenStafs = 8;
  // 20 is the number of tones spaces above the Treple stafs first line
  protected trepleStafYOffset = 24 * this.toneSpacing;
  protected bassStafYOffset = this.trepleStafYOffset + (this.linesInStaf + this.linesBetweenStafs) * this.lineSpacing;
  protected tones: Tones = {
    'B': 0,
    'A': 1,
    'G': 2,
    'F': 3,
    'E': 4,
    'D': 5,
    'C': 6
  };
  protected trepleClefImg: HTMLImageElement;
  protected bassClefImg: HTMLImageElement;
  protected quarterNoteImg: HTMLImageElement;

  private assertContext(context: unknown): asserts context is CanvasRenderingContext2D {
    if (context == null || !(context instanceof CanvasRenderingContext2D)) {
      throw new Error('Canvas context was not found');
    }
  }

  constructor(canvas: HTMLCanvasElement, window: Window, symbolState: SymbolState, options?: OptionProps) {
    this.canvas = canvas;
    this.context = this.getContext();
    this.options = options || { xPadding: this.barWidth / 2, yPadding: 0 };
    this.trepleStafYOffset = this.trepleStafYOffset + this.options.yPadding;

    this.trepleClefImg = new Image();
    // TODO: Put images somewhere else
    this.trepleClefImg.src = '../src/app/images/music-notes-treple-clef.svg';
    const treplePromise = new Promise(resolve => {
      this.trepleClefImg.onload = () => resolve();
    });

    this.bassClefImg = new Image();
    // TODO: Put images somewhere else
    this.bassClefImg.src = '../src/app/images/music-notes-bass-clef.svg';
    const bassPromise = new Promise(resolve => {
      this.bassClefImg.onload = () => resolve();
    });

    this.quarterNoteImg = new Image();
    // TODO: Put images somewhere else
    this.quarterNoteImg.src = '../src/app/images/quarter-note.svg';
    const quaterPromise = new Promise(resolve => {
      this.quarterNoteImg.onload = () => resolve();
    });

    Promise.all([treplePromise, bassPromise, quaterPromise]).then(() => {
      this.initCanvas(window, symbolState);
    });
  }

  private getContext(): CanvasRenderingContext2D {
    const context = this.canvas.getContext('2d');
    this.assertContext(context);
    return context;
  }

  private initCanvas(window: Window, symbolState: SymbolState) {
    const ratio = this.getPixelRatio(window);
    const width = parseInt(getComputedStyle(this.canvas).getPropertyValue('width').slice(0, -2));
    const height = parseInt(getComputedStyle(this.canvas).getPropertyValue('height').slice(0, -2));
    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    
    this.draw(symbolState);
  }

  private getPixelRatio(window: Window) {
    const backingStore = this.context.webkitBackingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
  }

  public draw(drawState: SymbolState): void {
    const symbolState =  Object.assign({ trebleClef: true }, drawState);

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
    this.drawStafs(symbolState);
    this.drawClefs(symbolState);
    this.drawKeySignatures(symbolState);
    this.drawTimesignature(symbolState);
    this.drawNotes(symbolState);
    // this.drawSmallLines();
  }
  
  // private drawSmallLines() {
  //   for (let i = 0; i < 33; i++) {
  //     this.context.moveTo(this.options.xPadding + 200, i * this.lineSpacing);
  //     this.context.lineTo(this.options.xPadding + 239, i * this.lineSpacing);
  //   }
  //   this.context.lineWidth = this.lineWidth;
  //   this.context.strokeStyle = '#ff4444';
  //   this.context.stroke();
  //   this.context.strokeStyle = '#000000';
  // }

  private drawStafs(symbolState: SymbolState) {
    // Treple Staf
    this.context.beginPath();
    // Set alpha for treple cleff staff and back bar
    this.context.globalAlpha = symbolState.trebleClef ? 1 : this.inactiveAlpha;
    // Draw staff
    for (let i = 0; i < this.linesInStaf; i++) {
      this.context.moveTo(this.options.xPadding, this.trepleStafYOffset + i * this.lineSpacing);
      this.context.lineTo(this.canvas.width - this.options.xPadding, this.trepleStafYOffset + i * this.lineSpacing);
    }
    this.context.lineWidth = this.lineWidth;
    this.context.stroke();

    // Treple Staf back bar
    this.context.beginPath();
    this.context.moveTo(this.options.xPadding, this.trepleStafYOffset);
    this.context.lineTo(this.options.xPadding, this.trepleStafYOffset + (this.linesInStaf - 1) * this.lineSpacing);
    this.context.lineWidth = this.barWidth;
    this.context.stroke();
    // Reset alpha
    this.context.globalAlpha = 1;

    // Back bar between cleffs
    this.context.beginPath();
    this.context.globalAlpha = symbolState.trebleClef && symbolState.bassClef ? 1 : this.inactiveAlpha;
    this.context.moveTo(this.options.xPadding, this.trepleStafYOffset + (this.linesInStaf - 1) * this.lineSpacing);
    this.context.lineTo(this.options.xPadding, this.bassStafYOffset);
    this.context.lineWidth = this.barWidth;
    this.context.stroke();
    // Reset alpha
    this.context.globalAlpha = 1;

    // Bass Staf
    this.context.beginPath();
    // Set alpha for bass cleff and back bar
    this.context.globalAlpha = symbolState.bassClef ? 1 : this.inactiveAlpha;
    for (let i = 0; i < this.linesInStaf; i++) {
      this.context.moveTo(this.options.xPadding, this.bassStafYOffset + i * this.lineSpacing);
      this.context.lineTo(this.canvas.width - this.options.xPadding, this.bassStafYOffset + i * this.lineSpacing);
    }
    this.context.lineWidth = this.lineWidth;
    this.context.stroke();

    // Bass Staf back bar
    this.context.beginPath();
    this.context.moveTo(this.options.xPadding, this.bassStafYOffset);
    this.context.lineTo(this.options.xPadding, this.bassStafYOffset + (this.linesInStaf - 1) * this.lineSpacing);
    this.context.lineWidth = this.barWidth;
    this.context.stroke();
    // Reset alpha
    this.context.globalAlpha = 1;
    
  }

  private drawClefs(symbolState: SymbolState) {
    const scale = .8;

    this.context.globalAlpha = symbolState.trebleClef ? 1 : this.inactiveAlpha;
    this.context.drawImage(
      this.trepleClefImg,
      this.options.xPadding + 16,
      this.trepleStafYOffset - 25,
      this.trepleClefImg.width * scale,
      this.trepleClefImg.height * scale
    );
    // Reset alpha
    this.context.globalAlpha = 1;

    this.context.globalAlpha = symbolState.bassClef ? 1 : this.inactiveAlpha;
    this.context.drawImage(
      this.bassClefImg,
      this.options.xPadding + 16,
      this.bassStafYOffset,
      this.bassClefImg.width * scale,
      this.bassClefImg.height * scale
    );
    // Reset alpha
    this.context.globalAlpha = 1;
  }

  private drawKeySignatures(symbolState: SymbolState) {
    // TODO: Draw key signatures
  }

  private drawTimesignature(symbolState: SymbolState) {
    // TODO: Draw time signature
  }

  private drawNotes(symbolState: SymbolState) {
    if (symbolState.notes && symbolState.notes.length > 0) {
      symbolState.notes.forEach(note => {
          const notePosition = this.getTrepleCleffNotePosition(note, { baseClef: symbolState.bassClef });
          this.context.drawImage(
            this.quarterNoteImg,
            notePosition.x,
            notePosition.y,
            this.quarterNoteImg.width,
            this.quarterNoteImg.height
          );
      });
    }
  }
  
  private assertTone(tone: unknown): asserts tone is Tones {
    if (typeof tone !== 'string' || !Object.keys(this.tones).includes(tone)) {
      throw new Error('Unknown tone');
    }
  }
  // How to determine note position. If I have a note offset that matches the top most note I could just add to that
  private getTrepleCleffNotePosition(note: Note, { baseClef = false }) {
    const [toneRaw, pos] = note.note.split(' ');
    const tone = toneRaw.split('')[0];
    this.assertTone(tone);
    const baseClefToneYOffset = 14 * this.toneSpacing;
    const toneYOffset =
      this.tones[tone as keyof Tones] *
      this.toneSpacing +
      (8 - parseInt(pos)) *
      this.toneSpacing *
      7 -
      this.toneSpacing +
      (baseClef ?  baseClefToneYOffset : 0);
    return {
      x: this.options.xPadding + 205,
      y: toneYOffset
    }
  }
}