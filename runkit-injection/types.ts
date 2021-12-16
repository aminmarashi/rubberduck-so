import { FakeNotebook } from './FakeNotebook';

export interface NotebookContainer {
  name: string;
  notebook: FakeNotebook;
  dependsOn: string[];
}