import { ConfigPage } from "..";

interface FilterdConfigPage extends ConfigPage {
  matchPath: string;
}

export function forEachClientPath(
  paths: ConfigPage[],
  handleClientPath: (page: FilterdConfigPage) => void,
): void {
  for (const path of paths) {
    if (path?.matchPath) {
      console.info("Registering client-only route: ", path.path);
      handleClientPath(path as FilterdConfigPage);
    }
  }
}
