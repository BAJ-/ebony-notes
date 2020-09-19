import { ipcRenderer } from 'electron';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { KeyNote } from '../../data/midi-hex-table';

interface SheetmusciViewProps {
  pianoConnected: boolean;
}

export class SheetmusicView extends React.PureComponent<SheetmusciViewProps, { keysPressed: KeyNote[] }> {
  constructor(props: SheetmusciViewProps) {
    super(props);

    this.state = {
      keysPressed: []
    }
  }



  componentDidMount(): void {
    ipcRenderer.on('keys-pressed', (_, options) => {
      this.setState({ keysPressed: options.keysPressed });
    }); 
  }

  public render(): JSX.Element {
    return (
      <div>
          <h1>Sheetmusic</h1>
          <Link to="/">Home</Link>
          
          <div className={this.props.pianoConnected ? '' : 'pointer-events-none opacity-50'}>
            <h1>Key pressed: {this.state.keysPressed.map(k => k.note).join(', ')}</h1>
          </div>
      </div>
    );
  }
}