import { Resource, ResourceConfig } from './Resource';

export const handleResponse = (resp: Response, config: Partial<ResourceConfig> = {}): Promise<Resource> => {
  if (resp.status >= 400 && resp.status < 600) {
    throw new Error(resp.status.toString());
  }

  return resp.text()
    .then(text => new Resource(text ? JSON.parse(text) : {}, {
      ...config,
      headers: resp.headers
    }));
}
