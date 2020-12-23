import {
  getDeviceList, on as onUsbEvent, Device as PianoDevice, InEndpoint
} from 'usb';
import { BrowserWindow } from 'electron';
import { getKeyFromHex } from './app/utils/tones';

export class PianoConnector {
  private keysPressed: string[] = [];
  private piano: PianoDevice | undefined;
  private vendorMap: number[] = [
    1177 // Yamaha Piano
  ];

  /**
   * @description Asserts a device InEndpoint
   * @param endpoint {unknown}
   */
  private assertInEndpoint (endpoint: unknown): asserts endpoint is InEndpoint {
    if (!(endpoint instanceof InEndpoint)) {
      throw new Error('Endpoint is not a valid InEndpoint');
    }
  }

  /**
   * @description Returns the vendor ID of the specific device
   * @param device {PianoDevice}
   */
  private getVendorId = (device: PianoDevice): number | undefined => {
    return device && device.deviceDescriptor && device.deviceDescriptor.idVendor;
  }

  constructor (private appWindow: BrowserWindow = appWindow) {
    this.findPiano();
    onUsbEvent('attach', this.findPiano)
    onUsbEvent('detach', device => {
      if (this.getVendorId(this.piano) === this.getVendorId(device)) {
        this.piano = undefined;
        this.keysPressed = [];
        this.emit('piano-connection', { pianoConnected: false });
      }
    })
  }

  /**
   * @description Looks for a piano among connected devices
   * @returnType {PianoDevice|undefined}
   */
  private findPiano = () => {
    const piano = getDeviceList().find(device => this.vendorMap.includes(this.getVendorId(device)));
    if (piano) {
      this.connectToPiano(piano);
    }
  }

  /**
   * @description Attempts to connect to a given piano
   * @param piano {PianoDevice} Device recognized as a Piano
   */
  private connectToPiano = (piano: PianoDevice) => {
    try {
      piano.open();
      const pianoInterface = piano.interfaces.find(pianoInterface => {
        // Looking for an interface with endpoints to listen too
        return pianoInterface.endpoints.length > 0;
      });
      pianoInterface.claim();
      const inEndpoint = pianoInterface.endpoints.find(endpoint => endpoint.direction === "in");
      this.assertInEndpoint(inEndpoint);
      inEndpoint.startPoll();
      inEndpoint.on('data', this.processPianoData);
      inEndpoint.on('error', (e) => {
        throw new Error(`Endpoint error ${e.message}`)
      });
      this.piano = piano;
      this.emit('piano-connection', { pianoConnected: true });
    } catch (e) {
      throw new Error(`Unable to connecto to piano: ${e.message}`);
    }
  }

  private keyIsPressed = (midiHex: string) => {
    return midiHex.slice(0,4) === '0990';
  }
  
  private keyIsReleased = (midiHex: string) => {
    return midiHex.slice(0, 4) === '0880';
  }

  private processPianoData = (data) => {
    try {
      const midiHex = data.toString('hex').toUpperCase();
      if (midiHex && midiHex !== '0FFE0000') {
        const hexTone = midiHex.slice(4, 6);
        if (this.keyIsPressed(midiHex)) {
          this.keysPressed = [getKeyFromHex(hexTone), ...this.keysPressed];
        }
        if (this.keyIsReleased(midiHex)) {
          this.keysPressed = this.keysPressed.filter(key => key !== getKeyFromHex(hexTone));
        }
        this.emit('keys-pressed', { keysPressed: this.keysPressed });
      }
    } catch (e) {
      throw new Error(`Data processing error: ${e.message}`);
    }
  }

  /**
   * @description Emits events to the frontend
   * @param channel {string} Channel to emit payload on
   * @param payload {Record<string, unknown>} Optional payload send to frontend
   */
  private emit = (channel: string, payload?: Record<string, unknown>) => {
    this.appWindow.webContents.send(channel, payload);
  }
}