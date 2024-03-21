
let _midiController;

p5.prototype.midiMode = function () {
  _fab.midiMode = true;
};

p5.prototype.createMidiController = function (debug = false) {
  _midiController = new MidiController(debug);
  return _midiController;
};

const MidiTypes = {
  NOTEON: 144, // button down
  NOTEOFF: 127, // button up
}

class MidiData {
  constructor(data) {
    this.command = parseFloat(data[0] >> 4)
    this.channel = parseFloat(data[0] & 0xf)
    this.type = parseFloat(data[0] & 0xf0)
    this.note = parseFloat(data[1])
    this.velocity = parseFloat(data[2])
  }

  mapVelocity(start, end) {
    return round(map(this.velocity, 0, 127, start, end), 2);
  }
}

class MidiController {
  constructor(debug) {
    if (navigator.requestMIDIAccess) console.log('This browser supports WebMIDI!');
    else console.log('WebMIDI is not supported in this browser.');

    navigator.requestMIDIAccess()
      .then(this.onMIDISuccess.bind(this), this.onMIDIFailure.bind(this));

    this.debug = debug;
  }

  onMIDISuccess(midiAccess) {
    const midi = midiAccess
    const inputs = midi.inputs.values()
    const input = inputs.next()
    input.value.onmidimessage = this.onMIDIMessage
  }

  onMIDIFailure(e) {
    console.log('Could not access your MIDI devices: ', e)
  }


  onMIDIMessage(message) {
    const midiData = new MidiData(message.data);

    if (_midiController.debug) {
      console.log(midiData);
    }

    if (_fab.midiSetup) {
      _fab.midiSetup(midiData);
    }

  }
}


