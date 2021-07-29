import { IRedirect } from "gatsby/dist/redux/types";

export function forEachRedirect(redirects: IRedirect[], handleRedirect: (r: IRedirect) => void) {
  for (const redirect of redirects) {
    handleRedirect(redirect);
  }
}

export function getResponseCode(redirect: IRedirect): HttpResponseCodes {
  return redirect.statusCode || redirect.isPermanent ? HttpResponseCodes.MovedPermanently : HttpResponseCodes.Found
}

export enum HttpResponseCodes {
  MultipleChoices = 300,
  MovedPermanently = 301,
  Found = 302,
  SeeOther = 303,
  NotModified = 304,
  UseProxy = 305,
  SwitchProxy = 306,
  TemporaryRedirect = 307,
  PermanentRedirect = 308,
}
