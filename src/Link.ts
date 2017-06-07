import * as uriTemplate from 'uri-templates';
import { Resource, RawResource } from './Resource';
import { defaultRequestOptions } from './defaultRequestOptions';
import { handleResponse } from './handleResponse';

export interface Params {
  [key: string]: number | string;
}

export interface RawLink {
  href: string,
  templated?: boolean,
  name?: string
}

export class Link {
  constructor(protected _link: RawLink) { }

  fetch<T extends Resource>(params: Params = {}, options?: RequestInit): Promise<T> {
    let uri = uriTemplate(this._link.href).fillFromObject(params);
    options = defaultRequestOptions(options);

    return fetch(uri, options)
      .then(handleResponse);
  }
}
