import { Resource } from './Resource';

export const handleResponse = (resp: Response): Promise<Resource> => {
  if (resp.status >= 400 && resp.status < 600) {
    throw new Error(resp.status.toString());
  }

  return resp.text()
    .then(text => new Resource(text ? JSON.parse(text) : {}, resp.headers));
}
