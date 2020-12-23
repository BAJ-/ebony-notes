const tones = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B" ];
const tonesInOctave = tones.length;

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

  export function getRandomKey (bottomKey: string, topKey: string): string {
    const bottomKeyIndex = getIndexFromKey(bottomKey);
    const topKeyIndex = getIndexFromKey(topKey);
    const keyIndex = Math.floor(Math.random() * (topKeyIndex - bottomKeyIndex) + bottomKeyIndex);
    // The Midi key table starts at Hex key 15 which is 21 in decimal
    const midiHexOffset = 21
    const toneHex = (keyIndex + midiHexOffset).toString(16);
    return getKeyFromHex(toneHex);
  }
