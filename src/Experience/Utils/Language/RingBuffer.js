const DEFAULT = undefined;

class RingBuffer {
  constructor(size, onOverflow = null) {
    this.size = size;
    this.buffer = new Array(size, DEFAULT);
    this.count = 0;
    this.position = 0;
    this.totalCount = 0; // include discarded items
    this.onOverflow = onOverflow; // callback function
  }

  push(item) {
    this.position = (this.position + 1) % this.size;
    if (this.buffer[this.position] !== undefined && this.onOverflow) {
      this.onOverflow(this.buffer[this.position]);
    }
    this.buffer[this.position] = item;
    this.count++;
    if (this.count > this.size) {
      this.count = this.size;
    }
    this.totalCount++;
  }

  peek() {
    if (this.count === 0) {
      console.error("RingBuffer is empty");
      return undefined;
    }
    return this.buffer[this.position];
  }

  pop() {
    if (this.count === 0) {
      console.error("RingBuffer is empty");
      return undefined;
    }

    const item = this.buffer[this.position];
    this.buffer[this.position] = DEFAULT;
    this.position = (this.position - 1 + this.size) % this.size;
    this.count--;
    this.totalCount--;

    return item;
  }

  any() {
    return this.count !== 0;
  }
}
