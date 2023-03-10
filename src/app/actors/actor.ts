import { Events, KeyValue } from '../controllers/animator';

export type Point = {
  x: number;
  y: number;
}

export type Dimensions = {
  width: number;
  height: number;
}

export type KeyEventMap = {
  [key: string]: {
    onKeyDown?: () => void;
    onKeyUp?: () => void;
  };
}

export interface Actor {
  draw: (context: CanvasRenderingContext2D) => void;
  hasChanged: (events: Events) => boolean;
}

export class ActorClass implements Actor {
  protected respondsToMouse = false;
  protected respondsToKeys = false;
  protected hover = false;

  constructor(
    protected onClick?: () => void,
    protected onKeyMap?: KeyEventMap
  ) {}

  public draw(context: CanvasRenderingContext2D): void {
    throw Error('draw needs to be implemented');
  }

  public hasChanged(events: Events): boolean {
    let changed = false;
    if (this.respondsToMouse) {
      if (events.mousedown) {
        // TODO: Some actors should react to mouse down.
      }
      if (events.mouseup) {
        const { x, y } = events.mouseup;
        if (this.isPointInPath({x, y})) {
          this.onClick();
          changed = true;
        }
      }
      if (events.mousemove) {
        // Hovered
        if (this.isPointInPath(events.mousemove) && !this.hover) {
          this.hover = true;
          changed = true;
        // Un-hovered
        } else if (!this.isPointInPath(events.mousemove) && this.hover) {
          this.hover = false;
          changed = true;
        }
      }
    }
    if (this.respondsToKeys) {
      if (Array.isArray(events.keydown)) {
        events.keydown.forEach(evt => {
          if (this.reactsToKey(evt)) {
            if (this.onKeyMap[evt.name].onKeyDown) {
              this.onKeyMap[evt.name].onKeyDown();
              changed = true;
            }
          }
        });
      }
      if (events.keyup) {
        events.keyup.forEach(ku => {
          if (this.reactsToKey(ku)) {
            if (this.onKeyMap[ku.name].onKeyUp) {
              this.onKeyMap[ku.name].onKeyUp();
              changed = true;
            }
          }
        });
      }
    }
    return changed;
  }

  protected isPointInPath(point: Point): boolean {
    if (this.respondsToMouse) {
      throw Error('isPointInPath needs to be implemented');
    }
    return false;
  }

  protected reactsToKey(event: KeyValue): boolean {
    if (this.respondsToKeys) {
      throw Error('reactsToKey need to be implemented');
    }
    return false;
  }
}
