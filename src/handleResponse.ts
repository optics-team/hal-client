import { Resource, ResourceConfig } from './Resource';

export class HTTPError extends Error {
  status: number;
  statusText: string;
  body: string | {};

  constructor(statusText: string, status: number, body: string | {}) {
    super(statusText);
    Object.assign(this, { statusText, status, body });
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const handleResponse = (resp: Response, config: Partial<ResourceConfig> = {}): Promise<Resource> => {
  return resp.text()
    .then(text => {
      let body;
      try {
        body = JSON.parse(text);
      } catch (e) { }

      if (resp.status >= 400 && resp.status < 600) {
        throw new HTTPError(resp.statusText, resp.status, body);
      }

      return new Resource(body || {}, {
        ...config,
        headers: resp.headers
      });
    });
}
