import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import {
  getDeviceList, on as onUsbEvent, Device as PianoDevice, InEndpoint,
  Interface as PianoInterface
} from 'usb';
import { keyNotes, KeyNote } from './data/midi-hex-table';

interface PianoIdentity {
  deviceAddress: number;
  vendorName: string;
}

type KeyState = 'pressed' | 'released';

export class PianoConnector {
  private keysPressed: KeyNote[] = [];

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
    if (!(pianoInterface instanceof PianoInterface)) {
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
   * @description Asserts a KeyNote
   * @param keyNote {unknown}
   */
  private assertKeyNote(keyNote: unknown): asserts keyNote is KeyNote {
    if (keyNote == null) {
      throw new Error('Unable to find keyNote');
    }
  }

  constructor(private appWindow: BrowserWindow = appWindow) {
    this.listenForPianoDevice();
    this.listenForConnectEvent();
  }

  /**
   * @description Notifies the appWindow with connected pianos
   */
  private listenForPianoDevice() {
    this.emit('piano-list', this.getPianoIdentities());
    onUsbEvent('attach', () => this.emit('piano-list', this.getPianoIdentities()));
    onUsbEvent('detach', () => this.emit('piano-list', this.getPianoIdentities()));
  }

  /**
   * @description Listens for `connect-piano` events. When received it attempts to connect to the piano. In case of failure it notifies frontend on the `error` channel
   */
  private listenForConnectEvent() {
    ipcMain.on('connect-piano', (_: IpcMainEvent, pianoIdentity: PianoIdentity) => {
      try {
        this.connectToPiano(this.getPianoFromIdentity(pianoIdentity));
      } catch (e) {
        this.emit('error', e.message);
      }
    });
  }

  /**
   * @description Attempts to connect to a given piano
   * @param piano {PianoDevice} Device recognized as a Piano
   */
  private connectToPiano(piano: PianoDevice) {
    try {
      piano.open();

      const pianoInterface: PianoInterface | undefined = piano.interfaces.find(pianoInterface => {
        return pianoInterface.endpoints.length !== 0;
      });
      this.assertPianoInterface(pianoInterface);
      pianoInterface.claim();

      const inEndpoint: InEndpoint | undefined = pianoInterface.endpoints.find(this.inEndpointGuard);
      this.assertInEndpoint(inEndpoint);

      inEndpoint.startPoll();
      inEndpoint.on('error', e => {
        throw new Error(`Endpoint poll error: ${e.message}`);
      });

      inEndpoint.on('data', data => {
        const midiHex = data.toString('hex')
        if (midiHex !== '0ffe0000') {
          const keyState: KeyState = this.getKeyState(midiHex);
          const keyNote: KeyNote = this.getKey(midiHex);
          if (keyState === 'pressed') {
            this.keysPressed = [keyNote, ...this.keysPressed];
          } else {
            this.keysPressed = this.keysPressed.filter(key => key.hex !== keyNote.hex);
          }
          this.emit('keys-pressed', this.keysPressed);
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
  private getKey(midiHex: string): KeyNote {
    const noteHex = midiHex.slice(4, 6);
    const key: KeyNote | undefined = keyNotes.find(keyNote => keyNote.hex === noteHex);
    this.assertKeyNote(key);
    return key;
  }

  /**
   * @description Attempts to find a PianoDevice from a PianoIdentity
   * @param pianoIdentity {PianoIdentity}
   * @returnType {PianoDevice}
   */
  private getPianoFromIdentity(pianoIdentity: PianoIdentity): PianoDevice {
    try {
      const piano: PianoDevice | undefined = getDeviceList().find(p => p.deviceAddress === pianoIdentity.deviceAddress);
      this.assertPiano(piano);
      return piano;
    } catch (e) {
      throw new Error(`Unable to get piano from identity: ${e.message}`);
    }
  }

  private getVendorMap(): { [key: number]: string } {
    return {
      1177: "Yamaha Corporation"
    }
  }

  /**
   * @description Emits events to the frontend
   * @param channel {string} Channel to emit payload on
   * @param payload {any} Payload send to frontend
   */
  private emit(channel: string, payload: PianoIdentity[] | KeyNote[]) {
    this.appWindow.webContents.send(channel, payload);
  }

  /**
   * @description Generates a list of piano identities from connected devices
   * @returns {PianoIdentity[]} List of piano identities
   */
  private getPianoIdentities(): PianoIdentity[] {
    return getDeviceList().reduce<PianoIdentity[]>((pianoList, device) => {
      return this.getVendorMap()[device.deviceDescriptor.idVendor]
        ? [{
            deviceAddress: device.deviceAddress,
            vendorName: this.getVendorMap()[device.deviceDescriptor.idVendor]
          },
          ...pianoList]
        : pianoList;
    }, [] );
  }
}