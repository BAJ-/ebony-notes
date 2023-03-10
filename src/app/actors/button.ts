import { ActorClass, Point, Dimensions } from './actor';

export type ButtonProps = {
  draw?: {
    text?: {
      text: string;
      font: string;
      leftPadding: number;
      topPadding: number;
    };
    radius?: { tl: number, tr: number, bl: number, br: number };
    main?: {
      bgColor?: string;
      txtColor?: string;
      borderColor?: string;
    };
    hover?: {
      bgColor?: string;
      txtColor?: string;
      borderColor?: string;
    };
  };
  img?: {
    main?: HTMLImageElement;
    hover?: HTMLImageElement;
  };
}

export class Button extends ActorClass {

  constructor(
    protected position: Point,
    protected dimensions: Dimensions,
    protected onClick: () => void,
    private btnProps: ButtonProps
  ) {
    super(onClick);
    this.respondsToMouse = true;
  }

  public draw(context: CanvasRenderingContext2D): void {
    if (this.btnProps.img) {
      if (this.hover && this.btnProps.img.hover) {
        context.drawImage(
          this.btnProps.img.hover,
          this.position.x,
          this.position.y,
          this.dimensions.width,
          this.dimensions.height
        );
      } else {
        context.drawImage(
          this.btnProps.img.main,
          this.position.x,
          this.position.y,
          this.dimensions.width,
          this.dimensions.height
        );
      }
    } else if (this.btnProps.draw) {
      if (this.btnProps.draw.radius) {
        const { radius } = this.btnProps.draw;
        const { x, y } = this.position;
        const { width, height } = this.dimensions;
        context.beginPath();
        context.moveTo(x + radius.tl, y);
        context.lineTo(x + width - radius.tr, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        context.lineTo(x + width, y + height - radius.br);
        context.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        context.lineTo(x + radius.bl, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        context.lineTo(x, y + radius.tl);
        context.quadraticCurveTo(x, y, x + radius.tl, y);
        context.closePath();
      } else {
        context.rect(this.position.x, this.position.y, this.dimensions.width, this.dimensions.height);
      }
      if (this.hover && this.btnProps.draw.hover) {
        const { hover } = this.btnProps.draw;
        if (hover.bgColor) {
          context.fillStyle = hover.bgColor;
          context.fill();
        }
        if (hover.borderColor) {
          context.strokeStyle = hover.borderColor;
          context.stroke();
        }
        if (hover.txtColor) {
          const { text, font, leftPadding, topPadding } = this.btnProps.draw.text;
          const { x, y } = this.position;
          context.fillStyle = hover.txtColor;
          context.font = font;
          context.fillText(text, leftPadding + x, topPadding + y);
        }
      } else {
        const { main } = this.btnProps.draw;
        if (main.bgColor) {
          context.fillStyle = main.bgColor;
          context.fill();
        }
        if (main.borderColor) {
          context.strokeStyle = main.borderColor;
          context.stroke();
        }
        if (main.txtColor) {
          const { text, font, leftPadding, topPadding } = this.btnProps.draw.text;
          const { x, y } = this.position;
          context.fillStyle = main.txtColor;
          context.font = font;
          context.fillText(text, leftPadding + x, topPadding + y);
        }
      }
    }
  }

  protected isPointInPath(point: Point): boolean {
    return point.x >= this.position.x &&
      point.x <= this.position.x + this.dimensions.width &&
      point.y >= this.position.y && point.y <= this.position.y + this.dimensions.height;
  }
}

