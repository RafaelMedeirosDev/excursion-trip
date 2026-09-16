/**
 * Rendez-vous de N partes COM timeout.
 *
 * O timeout nao e defensivo, e essencial: depois da correcao (lock de linha), a
 * segunda parte fica bloqueada no Postgres e NUNCA chega na barreira. Sem
 * timeout o teste travaria ate o testTimeout e passaria a falhar justamente
 * quando o codigo esta certo.
 */
export class Barrier {
  private arrived = 0;
  private resolvers: Array<() => void> = [];
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly parties: number,
    private readonly timeoutMs = 500,
  ) {}

  arrive(): Promise<void> {
    this.arrived += 1;

    if (this.arrived >= this.parties) {
      this.release();
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.resolvers.push(resolve);
      this.timer ??= setTimeout(() => this.release(), this.timeoutMs);
    });
  }

  dispose(): void {
    this.release();
  }

  private release(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const pending = this.resolvers;
    this.resolvers = [];
    pending.forEach((resolve) => resolve());
  }
}
