# loopy-doopy

A simple javascript class for synchronising audio loops using web api. Designed for use with video game stems.

## Install
```
npm i loopy-doo
```

## Usage
```
import LoopyDoopy from 'loopy-doopy';

// create a new instance
const myLooper = new LoopyDoopy();

// Add audio files (asynchronously with ajax)
myLooper.loadSamples(
  './bagpipe-loop.wav',
  './tin-whistle-riff.mp3',
  './distorted-yodelling.mp3',
)

// Start the looper once the samples have been loaded
myLooper.onload = () => {
  myLooper.start();
}
```

NOTE: For this to work your samples must have equal duration or durations that are integer mutliples of one another.