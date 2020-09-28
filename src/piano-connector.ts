import { BrowserWindow } from 'electron';
import {
  getDeviceList, on as onUsbEvent, Device as PianoDevice, InEndpoint,
  Interface as PianoInterface
} from 'usb';
import { KeyNote } from './app/utils/interfaces'
import { keyNotes } from './data/midi-hex-table';

type KeyState = 'pressed' | 'released';

export class PianoConnector {
  private keysPressed: KeyNote[] = [];
  private piano: PianoDevice | undefined;
  private pianoInterface: PianoInterface | undefined;
  private inEndpoint: InEndpoint | undefined;

  /**
   * @description Asserts a PianoDevice
   * @param piano {unknown}
   */
  private assertPiano(piano: unknown): asserts piano is PianoDevice {
    if (!(piano instanceof PianoDevice)) {
      throw new Error('Piano is not a valid usb.Device');
    }
  }

  /**
   * @description Asserts a PianoInterface
   * @param pianoInterface {unknown}
   */
  private assertPianoInterface(pianoInterface: unknown): asserts pianoInterface is PianoInterface {
    if (pianoInterface == null) {
      throw new Error('Invalid piano Interface');
    }
  }

  /**
   * @description Asserts a device InEndpoint
   * @param endpoint {unknown}
   */
  private assertInEndpoint(endpoint: unknown): asserts endpoint is InEndpoint {
    if (!(endpoint instanceof InEndpoint)) {
      throw new Error('Endpoint is not a valid InEndpoint');
    }
  }

  /**
   * @description Guard for InEndpoint
   * @param endpoint {unknown}
   */
  private inEndpointGuard(endpoint: unknown): endpoint is InEndpoint {
    return endpoint instanceof InEndpoint;
  }

  /**
   * @description Guard for KeyNote
   * @param keyNote {unknown}
   */
  private isKeyNote(keyNote: unknown): keyNote is KeyNote {
    return keyNote != null;
  }

  constructor(private appWindow: BrowserWindow = appWindow) {
    this.findAndConnectToPiano();
  }

  /**
   * @description Looks for a piano to connect to
   */
  private findAndConnectToPiano() {
    if (this.canConnectToAPiano()) {
      this.assertPiano(this.piano);
      this.emit('piano-connection', { pianoConnected: true, vendor: this.getVendorMap()[this.piano.deviceDescriptor.idVendor] });
    }

    onUsbEvent('attach', () => {
      if (this.canConnectToAPiano()) {
        this.assertPiano(this.piano);
        this.emit('piano-connection', { pianoConnected: true, vendor: this.getVendorMap()[this.piano.deviceDescriptor.idVendor] });
      }
    });

    onUsbEvent('detach', device => {
      if (this.piano && this.piano.deviceDescriptor.idVendor && this.piano.deviceDescriptor.idVendor === device.deviceDescriptor.idVendor) {
        this.piano = undefined;
        this.inEndpoint = undefined;
        this.pianoInterface = undefined;
        this.emit('piano-connection', { pianoConnected: false });
      }
    });
  }

  /**
   * @description Determines if there is a piano to connect to by:
   * 1. Looking for a piano
   * 2. If a piano is found, starts the connection attempt
   * @returnType {boolean}
   */
  private canConnectToAPiano(): boolean {
    this.piano = this.findPiano();
    if (this.piano !== undefined) {
      try {
        this.connectToPiano(this.piano);
        return true;
      } catch (e) {
        this.emit('error', e.message);
      }
    }
    return false;
  }

  /**
   * @description Attempts to connect to a given piano
   * @param piano {PianoDevice} Device recognized as a Piano
   */
  private connectToPiano(piano: PianoDevice) {
    try {
      piano.open();

      this.pianoInterface = piano.interfaces.find(pianoInterface => {
        // Looking for an interface with endpoints to listen too
        return pianoInterface.endpoints.length !== 0;
      });
      this.assertPianoInterface(this.pianoInterface);
      this.pianoInterface.claim();

      this.inEndpoint = this.pianoInterface.endpoints.find(this.inEndpointGuard);
      this.assertInEndpoint(this.inEndpoint);

      this.inEndpoint.startPoll();
      this.inEndpoint.on('error', () => {
        // TODO: Do something
      });

      this.inEndpoint.on('data', data => {
        const midiHex = data.toString('hex').toUpperCase();
        if (midiHex && midiHex !== '0FFE0000') {
          const keyState = this.getKeyState(midiHex);
          const keyNote = this.getKey(midiHex);
          // TODO: Add timestamp to keys for rythm
          if (this.isKeyNote(keyNote)) {
            if (keyState === 'pressed') {
              this.keysPressed = [keyNote, ...this.keysPressed];
            } else {
              this.keysPressed = this.keysPressed.filter(key => key.hex !== keyNote.hex);
            }
            this.emit('keys-pressed', { keysPressed: this.keysPressed });
          }
        }
      });
    } catch (e) {
      throw new Error(`Unable to connecto to piano: ${e.message}`);
    }
  }

  /**
   * @description Returns the given key state. In case we don't have a pressed key, we assume it's released.
   * @param midiHex {string} String hex midi data received from a piano
   * @returnType {KeyState}
   */
  private getKeyState(midiHex: string): KeyState {
    return midiHex.slice(0,4) === '0990'
      ? 'pressed'
      : 'released';
  }

  /**
   * @description Finds a KeyNote based on the provided midiHex string
   * @param midiHex {string} String hex midi data received from a piano
   * @returnType {KeyNote}
   */
  private getKey(midiHex: string): KeyNote | undefined {
    const noteHex = midiHex.slice(4, 6);
    return keyNotes.find(keyNote => keyNote.hex === noteHex);
  }

  private getVendorMap(): { [key: number]: string } {
    return {
      1177: "Yamaha Piano"
    }
  }

  /**
   * @description Emits events to the frontend
   * @param channel {string} Channel to emit payload on
   * @param payload {Record<string, unknown>} Optional payload send to frontend
   */
  private emit(channel: string, payload?: Record<string, unknown>) {
    this.appWindow.webContents.send(channel, payload);
  }

  /**
   * @description Looks for a piano among connected devices
   * @returnType {PianoDevice|undefined}
   */
  private findPiano(): PianoDevice | undefined {
    return getDeviceList().find(device => this.getVendorMap()[device.deviceDescriptor.idVendor] !== undefined);
  }
}