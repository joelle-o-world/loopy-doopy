const AudioContext = window.AudioContext || window.webkitAudioContext;

export class LoopyDoopy {
    constructor(audioctx = new AudioContext) {
        this.ctx = audioctx;

        /** How many loops are loading? */
        this.loading = 0;

        this.buffers = [];
    }

    /** Asynchronously add audio files using xhttp requests. */
    loadSamples(...urls) {
        for(const i in urls) {
            let url = urls[i];
            let request = new XMLHttpRequest;
            request.open('get', url, true);
            request.responseType = 'arraybuffer';
            
            request.onload = async () => {
                let buffer = await this.ctx.decodeAudioData(request.response);
                --this.loading;
                // If loading count has reached zero fire `onload`.
                if(this.loading == 0 && this.onload)
                    this.onload();
            }

            ++this.loading;
            request.send();
        }
    }

    start(t = this.ctx.currentTime + 0.01) {
        this.bufferSources = [];
        this.gains = [];

        // Assemble the web audio api graph
        for(let i in this.buffers) {
            let bufferSource = this.ctx.createBufferSource();
            bufferSource.buffer = this.buffers[i];
            bufferSource.loop = true;
            this.bufferSources[i] = bufferSource;

            let gain = this.ctx.createGain();
            this.gains[i] = gain;

            bufferSource.connect(gain);
            gain.connect(this.ctx.destination);
        }

        for(let source of this.bufferSources)
            source.start(t);

        this.anchorTime = t;
    }

    loopDuration(channel=0) {
        return this.buffers[channel].duration / this.this.bufferSources[channel].playbackRate.value
    }

    nextLoopTime(channel = 0) {
        let loopDuration = this.loopDuration(channel)
        return Math.ceil(
            this.timeElapsed / loopDuration
        ) * loopDuration + this.anchorTime;
    }


    get currentTime() {
        return this.ctx.currentTime;
    }

    get timeElapsed() {
        return this.ctx.currentTime - this.anchorTime;
    }

    get loopProgress() {
        return (this.currentTime - this.previousLoopTime) / this.loopDuration();
    }

    /** At what time did the the current loop start */
    get previousLoopTime() {
        let loopDuration = this.loopDuration(0);
        return Math.floor(
            this.timeElapsed / loopDuration
        ) * loopDuration + this.anchorTime;
    }

    get numberOfChannels() {
        return this.gains.length;
    }

    randomChannel() {
        return Math.floor(Math.random() * this.numberOfChannels);
    }

    /** How much time remains of the current loop. */
    leftOnLoop(channel = 0) {
        return this.nextLoopTime(channel) - this.ctx.currentTime;
    }

    scheduleMute(channel, time) {
        this.gains[channel].gain.setValueAtTime(0, time);
    }

    scheduleUnmute(channel, time) {
        this.gains[channel].gain.setValueAtTime(1, time);
    }

    randomMuteAtNextLoop() {
        let channel = Math.floor(Math.random() * this.numberOfChannels);
        this.scheduleMute(channel, this.nextLoopTime(channel));
    }

    randomUnmuteNow() {
        this.gains[this.randomChannel()].gain.value = 1;
    }

    isMuted(channel) {
        return this.gains[channel].gain.value == 0;
    }

    toggleAtNextLoop(channel=this.randomChannel()) {
        if(this.isMuted(channel))
            this.scheduleUnmute(channel, this.nextLoopTime(channel));
        else
            this.scheduleMute(channel, this.nextLoopTime())
    }

    toggleNow(channel = this.randomChannel()) {
        if(this.isMuted(channel))
            this.gains[channel].gain.value = 1;
        else
            this.gains[channel].gain.value = 0;
    }

    changeSpeed(playbackRate) {
        let loopProgress = this.loopProgress();

        for(let source of this.bufferSources)
            source.playbackRate.value = playbackRate;

        this.anchorTime = this.currentTime - loopProgress * this.loopDuration();
    }

    /** How many channels are unmuted and playing now. */
    get playingCount() {
        let n = 0;
        let numberOfChannels = this.numberOfChannels
        for(let c=0; c<numberOfChannels; ++c)
            if(!this.isMuted(c))
                ++n;

        return n;
    }
}

export default LoopyDoopy;