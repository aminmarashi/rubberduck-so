export class FakeNotebook {
  constructor(private source: string) {}
  async getSource() {
    return this.source;
  }
  async setPreamble(code: string): Promise<void> {
    // nothing to do here
  }
}