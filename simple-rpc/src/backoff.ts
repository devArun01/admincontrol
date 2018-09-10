/**
 * Backoff Policy for exponential backoff
 *
 * const backOff = new BackOff()
 * console.log(backoff.duration) // 236
 * console.log(backoff.duration) // 511
 *
 * backoff.reset()
 */
export class BackOff {
  /**
   * ms min retry interval in ms
   */
  private readonly ms: number
  /**
   * max max interval cap in ms
   */
  private readonly max: number
  /**
   * factor exponential factor
   */
  private readonly factor: number
  /**
   * jitter randomness for backoff
   */
  private readonly jitter: number
  private attempts = 0

  constructor(ms = 200, max = 10 * 1000, factor = 3, jitter = 0.5) {
    this.ms = ms
    this.max = max
    this.factor = factor
    this.jitter = jitter
    this.attempts = 0
  }

  get duration(): number {
    let ms = this.ms * Math.pow(this.factor, this.attempts++)
    const rand = Math.random()
    const deviation = rand * this.jitter * this.ms

    ms = (Math.floor(rand * 10) & 1) === 0 ? ms - deviation : ms + deviation
    let delay = Math.min(ms, this.max)
    delay = delay >= 0 ? delay : 0
    return ~~delay
  }

  reset() {
    this.attempts = 0
  }
}
