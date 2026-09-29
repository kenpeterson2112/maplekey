import { walkthroughKey, type Grade, type SubjectId } from '../catalog';
import type { WalkthroughScript } from './types';

// Each file in ./content is named `<grade>-<subject>-<topic>.json`.
// Adding a walkthrough is just adding a file; they're code-split and only
// the one a teacher picks is downloaded.
const loaders = import.meta.glob<WalkthroughScript>('./content/*.json', { import: 'default' });

function pathFor(key: string): string {
  return `./content/${key}.json`;
}

export function hasWalkthrough(grade: Grade, subject: SubjectId, topicId: string): boolean {
  return pathFor(walkthroughKey(grade, subject, topicId)) in loaders;
}

export async function loadWalkthrough(
  grade: Grade,
  subject: SubjectId,
  topicId: string,
): Promise<WalkthroughScript | null> {
  const load = loaders[pathFor(walkthroughKey(grade, subject, topicId))];
  return load ? load() : null;
}
