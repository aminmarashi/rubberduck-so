const { RunkitInjection } = require("./RunkitInjection");
const { FakeNotebook } = require("./FakeNotebook");
const { expect } = require('chai');

describe('Resolve dependencies', () => {
  it('should resolve a linear dependency', async () => {
    const containers = {
      'a': {
        name: 'a',
        dependsOn: [],
        notebook: new FakeNotebook('code a'),
      },
      'b': {
        name: 'b',
        dependsOn: ['a'],
        notebook: new FakeNotebook('code b'),
      }
    };
    const injection = new RunkitInjection(containers);

    const code = await injection.resolveCodeDependencies(containers.b);
    expect(code).to.eq('code a');
  });

  it('dependency can be defined later', async () => {
    const containers = {
      'a': {
        name: 'a',
        dependsOn: ['c'],
        notebook: new FakeNotebook('code a'),
      },
      'b': {
        name: 'b',
        dependsOn: ['a'],
        notebook: new FakeNotebook('code b'),
      },
      'c': {
        name: 'c',
        dependsOn: [],
        notebook: new FakeNotebook('code c'),
      }
    };
    const injection = new RunkitInjection(containers);

    const code = await injection.resolveCodeDependencies(containers.b);
    expect(code).to.eq('code c; code a');
  });

  it('circular dependencies are not allowed', async () => {
    const containers = {
      'a': {
        name: 'a',
        dependsOn: ['c'],
        notebook: new FakeNotebook('code a'),
      },
      'b': {
        name: 'b',
        dependsOn: ['a'],
        notebook: new FakeNotebook('code b'),
      },
      'c': {
        name: 'c',
        dependsOn: ['x', 'a'],
        notebook: new FakeNotebook('code c'),
      }
    };
    const injection = new RunkitInjection(containers);

    expect(injection.detectCircularDependency.bind(injection)).to.throw(/Circular dependency detected between c and a/);
  });

  it('multiple dependencies work', async () => {
    const containers = {
      'a': {
        name: 'a',
        dependsOn: [],
        notebook: new FakeNotebook('code a'),
      },
      'b': {
        name: 'b',
        dependsOn: ['a'],
        notebook: new FakeNotebook('code b'),
      },
      'c': {
        name: 'c',
        dependsOn: ['a', 'b'],
        notebook: new FakeNotebook('code c'),
      }
    };
    const injection = new RunkitInjection(containers);

    const code = await injection.resolveCodeDependencies(containers.c);
    expect(code).to.eq('code a; code b');
  });
});