import { Path } from 'loro-crdt';

export const pathStartsWith = (path: Path, prefix: Path): boolean => {
  for (let i = 0; i < prefix.length; i++) {
    if (i >= path.length || path[i] !== prefix[i]) {
      return false;
    }
  }
  return true;
};

export const pathEquals = (path1: Path, path2: Path): boolean => {
  if (path1.length !== path2.length) {
    return false;
  }
  for (let i = 0; i < path1.length; i++) {
    if (path1[i] !== path2[i]) {
      return false;
    }
  }
  return true;
};
