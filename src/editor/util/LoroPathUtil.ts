import { Path } from 'loro-crdt';

export const pathStartsWith = (path: Path, prefix: Path): boolean => {
  for (let i = 0; i < prefix.length; i++) {
    if (i >= path.length || path[i] !== prefix[i]) {
      return false;
    }
  }
  return true;
};
