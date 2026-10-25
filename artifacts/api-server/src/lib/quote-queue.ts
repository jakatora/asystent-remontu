/** FIFO permits for anonymous retailer quotes. Both waiting time and queue
 * length are bounded; handing a permit to the next waiter cannot exceed the
 * concurrency limit or starve another request behind a large renovation. */
export class QuoteQueue {
  private active = 0;
  private waiting: { resolve: (release: (() => void) | null) => void; timer: ReturnType<typeof setTimeout> }[] = [];
  constructor(private concurrency = 3, private maxQueued = 12, private maxWaitMs = 15_000) {}

  acquire(): Promise<(() => void) | null> {
    if (this.active < this.concurrency) {
      this.active++;
      return Promise.resolve(this.releasePermit());
    }
    if (this.waiting.length >= this.maxQueued) return Promise.resolve(null);
    return new Promise(resolve => {
      const waiter = { resolve, timer: setTimeout(() => {
        const index = this.waiting.indexOf(waiter);
        if (index >= 0) this.waiting.splice(index,1);
        resolve(null);
      },this.maxWaitMs) };
      this.waiting.push(waiter);
    });
  }

  private releasePermit(): () => void {
    let released = false;
    return () => {
      if (released) return;
      released = true;
      const next = this.waiting.shift();
      if (next) { clearTimeout(next.timer); next.resolve(this.releasePermit()); }
      else this.active--;
    };
  }
}
