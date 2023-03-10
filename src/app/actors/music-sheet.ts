import { ActorClass, Point } from './actor';

export class MusicSheet extends ActorClass {

  constructor(
    protected position: Point,
    events: string[]
  ) {
    super();
    this.respondsToKeys = true;
  }

  public draw(context: CanvasRenderingContext2D): void {
    console.log(context);
  }

  protected reactsToEvent(event: string): boolean {
    return false;
  }
}
