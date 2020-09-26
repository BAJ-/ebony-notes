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

export interface MusicState {
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
  // 20 is the number of tones spaces above the treble stafs first line
  protected trebleStafYOffset = 24 * this.toneSpacing;
  protected bassStafYOffset = this.trebleStafYOffset + (this.linesInStaf + this.linesBetweenStafs) * this.lineSpacing;
  protected tones: Tones = {
    'B': 0,
    'A': 1,
    'G': 2,
    'F': 3,
    'E': 4,
    'D': 5,
    'C': 6
  };
  protected trebleClefImg: HTMLImageElement;
  protected bassClefImg: HTMLImageElement;
  protected quarterNoteImg: HTMLImageElement;

  private assertContext(context: unknown): asserts context is CanvasRenderingContext2D {
    if (context == null || !(context instanceof CanvasRenderingContext2D)) {
      throw new Error('Canvas context was not found');
    }
  }

  constructor(canvas: HTMLCanvasElement, window: Window, musicState: MusicState, options?: OptionProps) {
    this.canvas = canvas;
    this.context = this.getContext();
    this.options = options || { xPadding: this.barWidth / 2, yPadding: 0 };
    this.trebleStafYOffset = this.trebleStafYOffset + this.options.yPadding;

    this.trebleClefImg = new Image();
    this.bassClefImg = new Image();
    this.quarterNoteImg = new Image();
    this.loadImages().then(() => this.initCanvas(window, musicState));
  }

  private loadImages(): Promise<unknown> {
    // TODO: Put images somewhere else
    this.trebleClefImg.src = '../src/app/images/music-notes-treble-clef.svg';
    const treblePromise = new Promise(resolve => {
      this.trebleClefImg.onload = () => resolve();
    });

    // TODO: Put images somewhere else
    this.bassClefImg.src = '../src/app/images/music-notes-bass-clef.svg';
    const bassPromise = new Promise(resolve => {
      this.bassClefImg.onload = () => resolve();
    });

    // TODO: Put images somewhere else
    this.quarterNoteImg.src = '../src/app/images/quarter-note.svg';
    const quaterPromise = new Promise(resolve => {
      this.quarterNoteImg.onload = () => resolve();
    });

    return Promise.all([treblePromise, bassPromise, quaterPromise]);
  }

  private getContext(): CanvasRenderingContext2D {
    const context = this.canvas.getContext('2d');
    this.assertContext(context);
    return context;
  }

  private initCanvas(window: Window, musicState: MusicState) {
    const ratio = this.getPixelRatio(window);
    const width = parseInt(getComputedStyle(this.canvas).getPropertyValue('width').slice(0, -2));
    const height = parseInt(getComputedStyle(this.canvas).getPropertyValue('height').slice(0, -2));
    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    
    this.draw(musicState);
  }

  private getPixelRatio(window: Window): number {
    const backingStore = this.context.webkitBackingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
  }

  public draw(drawState: MusicState): void {
    const musicState =  Object.assign({ trebleClef: true }, drawState);

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
    this.drawStafs(musicState);
    this.drawClefs(musicState);
    this.drawKeySignatures(musicState);
    this.drawTimesignature(musicState);
    this.drawNotes(musicState);
  }

  private drawStafs(musicState: MusicState) {
    // treble Staf
    this.context.beginPath();
    // Set alpha for treble cleff staff and back bar
    this.context.globalAlpha = musicState.trebleClef ? 1 : this.inactiveAlpha;
    // Draw staff
    for (let i = 0; i < this.linesInStaf; i++) {
      this.context.moveTo(this.options.xPadding, this.trebleStafYOffset + i * this.lineSpacing);
      this.context.lineTo(this.canvas.width - this.options.xPadding, this.trebleStafYOffset + i * this.lineSpacing);
    }
    this.context.lineWidth = this.lineWidth;
    this.context.stroke();

    // treble Staf back bar
    this.context.beginPath();
    this.context.moveTo(this.options.xPadding, this.trebleStafYOffset);
    this.context.lineTo(this.options.xPadding, this.trebleStafYOffset + (this.linesInStaf - 1) * this.lineSpacing);
    this.context.lineWidth = this.barWidth;
    this.context.stroke();
    // Reset alpha
    this.context.globalAlpha = 1;

    // Back bar between cleffs
    this.context.beginPath();
    this.context.globalAlpha = musicState.trebleClef && musicState.bassClef ? 1 : this.inactiveAlpha;
    this.context.moveTo(this.options.xPadding, this.trebleStafYOffset + (this.linesInStaf - 1) * this.lineSpacing);
    this.context.lineTo(this.options.xPadding, this.bassStafYOffset);
    this.context.lineWidth = this.barWidth;
    this.context.stroke();
    // Reset alpha
    this.context.globalAlpha = 1;

    // Bass Staf
    this.context.beginPath();
    // Set alpha for bass cleff and back bar
    this.context.globalAlpha = musicState.bassClef ? 1 : this.inactiveAlpha;
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

  private drawClefs(musicState: MusicState) {
    const scale = .8;

    this.context.globalAlpha = musicState.trebleClef ? 1 : this.inactiveAlpha;
    this.context.drawImage(
      this.trebleClefImg,
      this.options.xPadding + 16,
      this.trebleStafYOffset - 25,
      this.trebleClefImg.width * scale,
      this.trebleClefImg.height * scale
    );
    // Reset alpha
    this.context.globalAlpha = 1;

    this.context.globalAlpha = musicState.bassClef ? 1 : this.inactiveAlpha;
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

  private drawKeySignatures(musicState: MusicState) {
    // TODO: Draw key signatures
  }

  private drawTimesignature(musicState: MusicState) {
    // TODO: Draw time signature
  }

  private drawNotes(musicState: MusicState) {
    if (musicState.notes && musicState.notes.length > 0) {
      musicState.notes.forEach(note => {
          const notePosition = this.getNotePosition(note, { baseClef: musicState.bassClef });
          this.context.drawImage(
            this.quarterNoteImg,
            notePosition.x,
            notePosition.y,
            this.quarterNoteImg.width,
            this.quarterNoteImg.height
          );
          this.drawSmallLines(notePosition, { bassClef: musicState.bassClef });
      });
    }
  }

  private toneIsAboveStaf(noteYPosition: number, bassClef = false): boolean {
    return (bassClef ? this.bassStafYOffset : this.trebleStafYOffset) > noteYPosition;
  }

  private toneIsBelowStaf(noteYPosition: number, bassClef = false): boolean {
    return ((bassClef ? this.bassStafYOffset : this.trebleStafYOffset) + (this.linesInStaf - 1) * this.lineSpacing) <= noteYPosition;
  }
  
  private drawSmallLine(noteXPosition: number, lineYPosition: number) {
    this.context.moveTo(noteXPosition - 6, lineYPosition);
    this.context.lineTo(noteXPosition + 30, lineYPosition);
  }

  private drawSmallLines(notePosition: { x: number, y: number }, {bassClef = false}) {
    this.context.beginPath();
    if (this.toneIsAboveStaf(notePosition.y, bassClef)) {
      const linesToTopOfNote = ((bassClef ? this.bassStafYOffset : this.trebleStafYOffset) - notePosition.y) / this.lineSpacing;
      const linesToDraw = linesToTopOfNote === Math.floor(linesToTopOfNote) ? linesToTopOfNote - 1 : Math.floor(linesToTopOfNote);
      for (let i = 1; i <= linesToDraw; i++) {
        const lineYPosition = (bassClef ? this.bassStafYOffset : this.trebleStafYOffset) - i * this.lineSpacing;
        this.drawSmallLine(notePosition.x, lineYPosition);
      }
    }

    if (this.toneIsBelowStaf(notePosition.y, bassClef)) {
      const stafBottomOffset = (bassClef ? this.bassStafYOffset : this.trebleStafYOffset) + (this.linesInStaf - 1) * this.lineSpacing;
      const linesToBottomOfNote = (notePosition.y - stafBottomOffset) / this.lineSpacing;
      const linesToDraw = linesToBottomOfNote === Math.ceil(linesToBottomOfNote) ? linesToBottomOfNote : Math.ceil(linesToBottomOfNote);
      for (let i = 1; i <= linesToDraw; i++) {
        const lineYPosition = stafBottomOffset + i * this.lineSpacing
        this.drawSmallLine(notePosition.x, lineYPosition);
      }
    }
    this.context.lineWidth = this.lineWidth;
    this.context.stroke();
  }

  private assertTone(tone: unknown): asserts tone is Tones {
    if (typeof tone !== 'string' || !Object.keys(this.tones).includes(tone)) {
      throw new Error('Unknown tone');
    }
  }

  private getNotePosition(note: Note, { baseClef = false }) {
    const [toneRaw, pos] = note.note.split(' ');
    const tone = toneRaw.split('')[0];
    this.assertTone(tone);
    const baseClefToneYOffset = 14 * this.toneSpacing;
    const toneYOffset =
      // Tone spacing
      this.tones[tone as keyof Tones] * this.toneSpacing +
      // Interval spacing
      (8 - parseInt(pos)) * this.toneSpacing * 7 -
      this.toneSpacing +
      (baseClef ?  baseClefToneYOffset : 0);
    return {
      x: this.options.xPadding + 205,
      y: toneYOffset
    }
  }
}