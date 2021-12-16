import { FakeNotebook } from "./FakeNotebook";
import { NotebookContainer } from "./types";

export class RunkitInjection {
  constructor(
    private notebookContainers: { [key: string] : NotebookContainer } = {},
    private resolvedCodes: { [key: string]: Set<string> } = {},
  ) {}

  public inject() {
    if (!(window as any).RunKit) {
      const runkit = document.createElement('script');
      runkit.src = 'https://embed.runkit.com';
      document.body.append(runkit);
      runkit.addEventListener('load', () => this.convertElements());
    } else {
      this.convertElements();
    }
  }
  private get notebookNames() {
    return Object.keys(this.notebookContainers);
  }
  private convertElements() {
    if (this.notebookNames.length) return;

    const elements: HTMLElement[] = Array.from(document.querySelectorAll('.embed'));

    this.notebookContainers = elements.reduce((notebookContainers, element) => {
      const notebookName = element.getAttribute('name') || Object.keys(notebookContainers).length;
      const dependsOn = element.getAttribute('depends-on')?.split(',') || [];
      const notebook = this.createNotebook(element);
      if (!notebook) return notebookContainers;
      return {...notebookContainers, [notebookName]: { name: notebookName, notebook, dependsOn }};
    }, {});

    this.updateSources();
  }
  private createNotebook(element?: HTMLElement) {
    const RunKit = (window as any).RunKit;
    if (!RunKit) throw new Error('Runkit is not defined or is not globally available');

    if (!element) return undefined;
    const childNodes = Array.from(element.childNodes);
    const source = element.innerText;
    if (!source) return undefined;

    return element.getAttribute('hidden') ?
      new FakeNotebook(element.innerText) :
      RunKit.createNotebook({
        element,
        source,
        onLoad: () => childNodes.forEach(child => child.remove()),
        onEvaluate: () => this.updateSources(),
      });
  }
  private async updateSources() {
    this.detectCircularDependency();
    /* List of dependencies must always come in order in the notebookNames */
    for (const notebookName of this.notebookNames) {
      const notebookContainer = this.notebookContainers[notebookName];
      await notebookContainer.notebook.setPreamble(await this.resolveCodeDependencies(notebookContainer));
    }
  }
  private async resolveDependencies(notebookContainer: NotebookContainer): Promise<Set<string>> {
    const { notebook, dependsOn, name } = notebookContainer;
    const resolved = await Promise.all(dependsOn.map(async (name: string) => {
      const resolved = this.resolvedCodes[name];
      if (resolved) return resolved;
      return this.resolveDependencies(this.notebookContainers[name]);
    }));
    const dependencies = resolved.flatMap(r => Array.from(r));
    this.resolvedCodes[name] = new Set([...dependencies, (await notebook.getSource())]);
    return this.resolvedCodes[name];
  }
  public async resolveCodeDependencies(notebookContainer: NotebookContainer): Promise<string> {
    const codes = Array.from(await this.resolveDependencies(notebookContainer));
    codes.pop();
    return codes.join('; ');
  }
  public detectCircularDependency() {
    const tree: { [key: string]: string[] } = {};
    for (const notebookName of this.notebookNames) {
      const { dependsOn, name } = this.notebookContainers[notebookName];
      for (const dependency of dependsOn) {
        if ((tree[dependency] || []).includes(name)) {
          throw new Error(`Circular dependency detected between ${name} and ${dependency}`);
        }
      }
      tree[name] = dependsOn;
    }
  }
}