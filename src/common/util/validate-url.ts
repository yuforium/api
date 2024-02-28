import { parse } from 'tldts';

export class InvalidURLException extends Error { }

/**
 * URL validation function
 * @returns a validated URL
 * @throws InvalidURLException if the URL doesn't meet specified criteria
 */
export function validateURL(rawURL: string): string {
  const url = new URL(rawURL);

  if (url.protocol !== 'https:') {
    throw new InvalidURLException('URL must be avaiable via https protocol');
  }

  if (url.port !== '') {
    throw new InvalidURLException('URL must not specify on default port');
  }

  const domain = parse(url.hostname);

  if (!domain.domain || !domain.isIcann || domain.isPrivate) {
    throw new InvalidURLException('URL contains an invalid domain or is a private domain');
  }

  return `https://${domain.hostname}${url.pathname}${url.search}${url.hash}`;
}
