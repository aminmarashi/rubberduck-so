if (!(window as any).RunKit) {
  const runkit = document.createElement('script');
  runkit.src = 'https://embed.runkit.com';
  document.body.append(runkit);
  runkit.addEventListener('load', function() {
    convertElements();
  });
} else {
  convertElements();
}

function convertElements() {
  const RunKit = (window as any).RunKit;

  const elements: HTMLElement[] = Array.from(document.querySelectorAll('.embed'));

  const notebooks = elements.reduce<any[]>((notebooks, element) => {
    const innerText = element.firstChild;
    if (!innerText) return notebooks;
    const notebook = element.getAttribute('hidden') ?
      { getSource: () => Promise.resolve(element.innerText) } :
      RunKit.createNotebook({
        element,
        source: innerText.textContent,
        onLoad: () => innerText.remove(),
        onEvaluate: () => updateSources(),
      });
    return [...notebooks, notebook];
  }, []);

  async function updateSources() {
    const codes = [];
    for (const notebook of notebooks) {
      const code = await notebook.getSource();
      await notebook.setPreamble(codes.reduce((acc, c) => `${acc}; ${c}`, ''));
      codes.push(code);
    }
  }
}