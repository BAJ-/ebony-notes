import * as React from 'react';
import { ipcRenderer } from 'electron';
import { PianoIdentity } from '../../piano-connector';

interface ConnectionFloatProps {
  visible: boolean;
}

export class ConnectionFloat extends React.PureComponent<ConnectionFloatProps, { pianoList: PianoIdentity[] }> {

  constructor(props: ConnectionFloatProps) {
    super(props);

    this.state = {
      pianoList: []
    }
  }

  componentDidMount(): void {
    ipcRenderer.on('piano-list', (_, options) => this.setState({pianoList: options}));
  }

  public render(): JSX.Element {
    return (
      <div className={this.props.visible ? '' : 'hidden'}>
        <div className="absolute triangle"></div>
        <div className="absolute mx-6 mt-2 border-gray-200 right-0 border shadow-md">
          { 
            this.state.pianoList.length
            ? (
                this.state.pianoList.map((piano: PianoIdentity, i: number) => {
                  return (
                    <div key={`piano-${i}`} className="grid grid-cols-3 mx-4 my-3">
                      <div className="col-span-1"><div className="bg-purple-600 rounded-lg px-4 py-2 border text-gray-100 hover:text-indigo-200">connect</div></div>
                      <div className="col-span-2 whitespace-no-wrap content-center grid text-right">{piano.vendorName}</div>
                    </div>
                  );
                })
              )
            : <div>No pianos found</div>
          }
        </div>
      </div>
    );
  }
}