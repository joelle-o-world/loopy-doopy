# loopy-doopy

A simple javascript class for synchronising loops using web api. Designed for use with video game stems.

## Install
```
npm i loopy-doo
```

## Usage
```
import LoopyDoopy from 'loopy-doopy';

// create a new instance
const myLooper = new LoopyDoopy();

// Add samples (asynchronously with ajax)
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