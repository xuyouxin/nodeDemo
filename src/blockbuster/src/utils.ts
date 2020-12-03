export class Semaphore {

  queue: any[] = [];

  constructor(private size: number) {
  }

  async wait() {
    if (this.size < 1) {
      await new Promise((resolve) => this.queue.push(resolve));
    }
    this.size -= 1;
  }

  signal() {
    this.size += 1;
    const resolve = this.queue.shift();
    if (resolve) resolve();
  }
}

export function rsplit(str: string, sep: string, max: number) {
  const ss: string[] = str.split(sep);
  return max ? [ss.slice(0, -max).join(sep)].concat(ss.slice(-max)) : ss;
}
