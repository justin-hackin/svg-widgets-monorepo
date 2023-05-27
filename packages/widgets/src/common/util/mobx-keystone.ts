import { Path, resolvePath } from 'mobx-keystone';

export function tryResolvePath<T>(object: object, path: Path): T | undefined {
  const res = resolvePath<T>(object, path);
  return res.resolved ? res.value : undefined;
}
