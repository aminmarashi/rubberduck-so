export class RunkitInjection {
  private notebooks: any[] = [];

  inject() {
    if (!(window as any).RunKit) {
      const runkit = document.createElement('script');
      runkit.src = 'https://embed.runkit.com';
      document.body.append(runkit);
      runkit.addEventListener('load', () => this.convertElements());
    } else {
      this.convertElements();
    }
  }
  convertElements() {
    if (this.notebooks.length) return;

    const RunKit = (window as any).RunKit;

    const elements: HTMLElement[] = Array.from(document.querySelectorAll('.embed'));

    this.notebooks = elements.reduce<any[]>((notebooks, element) => {
      const childNodes = Array.from(element.childNodes);
      const source = element.innerText;
      if (!source) return notebooks;
      const notebook = element.getAttribute('hidden') ?
        new FakeNotebook(element.innerText) :
        RunKit.createNotebook({
          element,
          source,
          onLoad: () => childNodes.forEach(child => child.remove()),
          onEvaluate: () => this.updateSources(),
        });
      return [...notebooks, notebook];
    }, []);

    this.updateSources();
  }
  async updateSources() {
    const codes = [];
    for (const notebook of this.notebooks) {
      const code = await notebook.getSource();
      await notebook.setPreamble(codes.reduce((acc, c) => `${acc}; ${c}`, ''));
      codes.push(code);
    }
  }
}

class FakeNotebook {
  constructor(private source: string) {}
  async getSource() {
    return this.source;
  }
  async setPreamble() {
    // nothing to do here
  }
}