import { flatten, times, constant } from 'lodash';

const tones = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
const tonesInOctave = tones.length;
const scales = {
  major: [2, 2, 1, 2, 2, 2, 1],
  minor: [2, 1, 2, 2, 1, 2, 2],
  majorPentatonic: [2, 2, 3, 2, 3],
  minorPentatonic: [3, 2, 2, 3, 2]
};

function getIndexFromKey (key: string): number {
  const [tone, octave] = key.split(' ');
  const toneIndex = tones.indexOf(tone);
  // Midi starts with they Key A, we start with C
  const toneMidiOffset = 3;
  return (toneIndex + toneMidiOffset) + (parseInt(octave) - 1) * tonesInOctave;
}

/**
 * @description Finds a KeyNote based on the provided midiHex string
 * @param midiHex {string} String hex midi data received from a piano
 * @returnType {KeyNote}
 */
export function getKeyFromHex (toneHex: string): string {
  const keyNumber = parseInt(toneHex, 16);
  const toneNumber = keyNumber % tonesInOctave;
  const midiOctave = (keyNumber - toneNumber - tonesInOctave) / tonesInOctave;
  return `${tones[toneNumber]} ${midiOctave}`;
}

function getKeyFromIndex (keyIndex: number): string {
  // The Midi key table starts at Hex key 15 which is 21 in decimal
  const midiHexOffset = 21
  const toneHex = (keyIndex + midiHexOffset).toString(16);
  return getKeyFromHex(toneHex);
}

export function getRandomKey (bottomKey: string, topKey: string): string {
  // We add 1 for it to be inclusive
  const bottomKeyIndex = getIndexFromKey(bottomKey) + 1;
  const topKeyIndex = getIndexFromKey(topKey);
  const keyIndex = Math.floor(Math.random() * (topKeyIndex - bottomKeyIndex) + bottomKeyIndex);
  return getKeyFromIndex(keyIndex);
}

export function getScale (key: string, kind: string, octaves = 1): string[] {
  const upSignature = flatten(times(octaves, constant(scales[kind])));
  const signature = [...upSignature, ...upSignature.map(n => n * -1).reverse()];
  let scale = [key];
  for (let i = 0; i < signature.length; i++) {
    const keyIndex = getIndexFromKey(scale[i]);
    scale = [...scale, getKeyFromIndex(keyIndex + signature[i])];
  }
  return scale;
}