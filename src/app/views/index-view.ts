import { View, ViewLayers } from '../controllers/conductor';
import { Button } from '../actors/button';

export class IndexView implements View {
  public init(): Promise<ViewLayers> {
    return Promise.resolve({
      background: [
        new Button({
          x: 20,
          y: 20
        }, {
          width: 200,
          height: 100
        },
        () => { console.log('clicked') },
        {
          draw: {
            text: {
              text: 'Button',
              font: '30px Arian',
              leftPadding: 10,
              topPadding: 35
            },
            main: {
              bgColor: 'hotpink',
              txtColor: 'white'
            },
            hover: {
              bgColor: 'silver',
              txtColor: 'white'
            }
          }
        })
      ],
      foreground: [
      ]
    });
  }
}

