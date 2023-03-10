import { Actor, Point } from '../actors/actor';

export type KeyValue = {name: string, props?:{[key:string]: string}};

export type Events = {
  mousemove?: Point;
  mousedown?: Point;
  mouseup?: Point; // Maybe type should just be undefined?
  keydown?: KeyValue[];
  keyup?: KeyValue[];
};

export class Animator {
  private oldTimeStamp = 0;
  private fgActors: Actor[] = [];
  private fgUpdated = true;
  private bgActors: Actor[] = [];
  private bgUpdated = true;
  private events: Events = {
    keydown: [],
    keyup: []
  };

  constructor(
    private window: Window,
    private bgContext: CanvasRenderingContext2D,
    private fgContext: CanvasRenderingContext2D,
    private size: { width: number, height: number },
  ) {
   this.window.requestAnimationFrame(this.animationLoop); 
  }
  
  private animationLoop = (timeStamp: number) => {
    // Calculate time passed in seconds with a max of 0.1 seconds
    const secondsPassed = Math.min((timeStamp - this.oldTimeStamp) / 1000, 0.1);
    this.oldTimeStamp = timeStamp;
    // We clone events because they might change during animation
    const eventsClone = Object.assign({}, this.events);

    this.bgActors.forEach(actor => {
      if (actor.hasChanged(eventsClone)) {
        this.bgUpdated = true;
      }
    });
    this.fgActors.forEach(actor => {
      if (actor.hasChanged(eventsClone)) {
        this.fgUpdated = true;
      }
    });
    this.draw(secondsPassed);

    // Filter used keys
    if (Array.isArray(eventsClone.keyup)) {
      this.events.keydown = this.events.keydown.filter(kd => !eventsClone.keyup.find(kuc => kuc.name === kd.name));
      this.events.keyup = this.events.keyup.filter(ku => !eventsClone.keyup.find(kuc => kuc.name === ku.name));
    }

    // Reset mouse clicks
    if (eventsClone.mouseup) {
      this.events.mousedown = undefined;
      this.events.mouseup = undefined;
    }

    this.window.requestAnimationFrame(this.animationLoop)
  }
  
  // TODO: Use secondsPassed
  private draw = (secondsPassed: number) => {
    if (this.bgUpdated) {
      this.bgContext.clearRect(0, 0, this.size.width, this.size.height);
      for(let i = 0; i < this.bgActors.length; i++) {
        this.bgActors[i].draw(this.bgContext);
      }
      this.bgUpdated = false;
    }

    if (this.fgUpdated) {
      this.fgContext.clearRect(0, 0, this.size.width, this.size.height);
      for(let i = 0; i < this.fgActors.length; i++) {
        this.fgActors[i].draw(this.fgContext);
      }
      this.fgUpdated = false;
    }
  }
  
  public addActor = (context: string, actor: Actor): void => {
    if (context === 'bg') {
      this.bgActors.push(actor);
      this.bgUpdated = true;
    } else if (context === 'fg') {
      this.fgActors.push(actor);
      this.fgUpdated = true;
    }
  }

  public removeActor = (context: string, actor: Actor): void => {
    if (context === 'bg') {
      const index = this.bgActors.indexOf(actor);
      if (index > -1) {
        this.bgActors.splice(index, 1);
        this.bgUpdated = true;
      }
    } else if (context === 'fg') {
      const index = this.fgActors.indexOf(actor);
      if (index > -1) {
        this.fgActors.splice(index, 1);
        this.fgUpdated = true;
      }
    }
  }

  public setEvent= (event: string, value: Point | KeyValue): void => {
    if (Array.isArray(this.events[event])) {
      this.events[event].push(Object.assign({name: event}, value));
    } else {
      this.events[event] = value;
    }
  }
}

