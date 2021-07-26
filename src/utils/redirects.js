export function forEachRedirect(redirects, handleRedirect) {
  for (const redirect of redirects) {
    handleRedirect(redirect);
  }
}