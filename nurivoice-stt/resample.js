// Stateful linear resampling. No anti-alias low-pass filter: not suitable for
// claiming high-frequency fidelity. Outputs ceil(inputFrames * 16000 / rate)
// samples after flush, extending the last sample only at the stream boundary.
export class PCMResampler {
  constructor(inputRate, outputRate = 16000, chunkSize = 2560) {
    if (!Number.isFinite(inputRate) || inputRate <= 0 || !Number.isFinite(outputRate) || outputRate <= 0 ||
        !Number.isSafeInteger(chunkSize) || chunkSize < 1) throw new Error('Invalid resampler configuration');
    this.inputRate = inputRate;
    this.outputRate = outputRate;
    this.chunkSize = chunkSize;
    this.inputCount = 0;
    this.outputCount = 0;
    this.previous = 0;
    this.buffer = new Float32Array(chunkSize);
    this.used = 0;
    this.finished = false;
  }

  emit(value, chunks) {
    this.buffer[this.used++] = value;
    this.outputCount++;
    if (this.used === this.chunkSize) {
      chunks.push(this.buffer);
      this.buffer = new Float32Array(this.chunkSize);
      this.used = 0;
    }
  }

  push(channels) {
    if (this.finished) throw new Error('Resampler already flushed');
    if (!channels.length) return [];
    const length = channels[0].length;
    if (channels.some(c => c.length !== length)) throw new Error('Channel lengths differ');
    const chunks = [];
    for (let frame = 0; frame < length; frame++) {
      let current = 0;
      for (const channel of channels) {
        if (!Number.isFinite(channel[frame])) throw new Error('Nonfinite PCM');
        current += channel[frame] / channels.length;
      }
      const index = this.inputCount++;
      // Derive positions from the integer output count, avoiding accumulated
      // fractional step drift and making split boundaries irrelevant.
      while (this.outputCount * this.inputRate <= index * this.outputRate) {
        const position = this.outputCount * this.inputRate / this.outputRate;
        const fraction = index === 0 ? 1 : position - (index - 1);
        this.emit(index === 0 ? current : this.previous + (current - this.previous) * fraction, chunks);
      }
      this.previous = current;
    }
    return chunks;
  }

  flush() {
    if (this.finished) return [];
    this.finished = true;
    const chunks = [];
    // Emit only sample positions inside the original input duration.
    while (this.outputCount * this.inputRate < this.inputCount * this.outputRate) this.emit(this.previous, chunks);
    if (this.used) { chunks.push(this.buffer.slice(0, this.used)); this.used = 0; }
    this.buffer = new Float32Array(0);
    return chunks;
  }
}
