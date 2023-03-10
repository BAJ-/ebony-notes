import { Animator } from './animator';
import { IndexView } from '../views/index-view';
import { Actor } from '../actors/actor';

interface ExtendedCanvasRenderingContext2D extends CanvasRenderingContext2D {
  webkitBackingStorePixelRatio?: number;
}

export interface View {
  init: () => Promise<ViewLayers>
}

export type ViewLayers = {
  background: Actor[];
  foreground: Actor[];
}

export class Conductor {
  private bgContext: ExtendedCanvasRenderingContext2D | undefined;
  private fgContext: ExtendedCanvasRenderingContext2D | undefined;
  private animator: Animator | undefined;
  private ratio = 1;
  private views: ViewLayers[] = [];

  constructor(window: Window, fgCanvas: HTMLCanvasElement, bgCanvas: HTMLCanvasElement) {
    this.initCanvases(window, fgCanvas, bgCanvas);
    this.animator = new Animator(
      window,
      this.bgContext,
      this.fgContext,
      {width: bgCanvas.width, height: bgCanvas.height},
    );

    this.initViews().then(views => {
      this.views.push(views);
      this.addActors();
      // We only need to set the listener on one canvas
      this.initListeners(bgCanvas);
    });
  }

  private initCanvases(window: Window, fgCanvas: HTMLCanvasElement, bgCanvas: HTMLCanvasElement): void {
    this.bgContext = bgCanvas.getContext('2d');
    this.fgContext = fgCanvas.getContext('2d');

    // We only need to do this calculation on one canvas so we pick bgCanvas
    const backingStore = this.bgContext.webkitBackingStorePixelRatio || 1;
    this.ratio = (window.devicePixelRatio || 1) / backingStore;
    const width = parseInt(getComputedStyle(bgCanvas).getPropertyValue('width').slice(0, -2));
    const height = parseInt(getComputedStyle(bgCanvas).getPropertyValue('height').slice(0, -2));

    // Transform bgCanvas
    bgCanvas.width = width * this.ratio;
    bgCanvas.height = height * this.ratio;
    bgCanvas.style.width = `${width}px`;
    bgCanvas.style.height = `${height}px`;
    this.bgContext.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    // Transform fgCanvas
    fgCanvas.width = width * this.ratio;
    fgCanvas.height = height * this.ratio;
    fgCanvas.style.width = `${width}px`;
    fgCanvas.style.height = `${height}px`;
    this.fgContext.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
  }

  private initViews(): Promise<ViewLayers> {
    return (new IndexView()).init();
  }

  private initListeners(canvas: HTMLCanvasElement): void {
    const boundingClientRect = canvas.getBoundingClientRect();
    canvas.addEventListener('mousemove', (evt) => {
      const x = evt.clientX - boundingClientRect.left;
      const y = evt.clientY - boundingClientRect.top;
      this.animator.setEvent('mousemove', {x, y});
    }, false);

    canvas.addEventListener('mousedown', (evt) => {
      const x = evt.clientX - boundingClientRect.left;
      const y = evt.clientY - boundingClientRect.top;
      this.animator.setEvent('mousedown', {x, y});
    });
    canvas.addEventListener('mouseup', (evt) => {
      const x = evt.clientX - boundingClientRect.left;
      const y = evt.clientY - boundingClientRect.top;
      this.animator.setEvent('mouseup', {x, y});
    });
  }

  private addActors() {
    // TODO: We need some kind of view state so we can switch views.
    //       Though not in this method...
    this.views[0].background.forEach(actor => {
      this.animator.addActor(
        'bg',
        actor
      );
    });
    this.views[0].foreground.forEach(actor => {
      this.animator.addActor(
        'fg',
        actor
      );
    });
  }
}

