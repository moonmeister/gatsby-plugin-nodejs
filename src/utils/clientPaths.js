export function forEachClientPath(paths, handleClientPath) {
  for (const path of paths.filter((p) => p.matchPath)) {
    handleClientPath(p);
  }
}