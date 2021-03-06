import * as uriTemplate from 'uri-templates';
import { defaultsDeep } from 'lodash';
import { Resource, RawResource } from './Resource';
import { handleResponse } from './handleResponse';

export interface Params {
  [key: string]: string | {
    [key: string]: string
  }
}

export interface RawLink {
  href: string,
  templated?: boolean,
  name?: string
}

export interface LinkConfig {
  requestHeaders: Headers
}

const DEFAULT_REQUEST_OPTIONS = {
  headers: {
    Accept: 'application/hal+json'
  }
};

export class Link implements RawLink {
  constructor(protected _link: RawLink, public config: Partial<LinkConfig> = {}) {
    Object.assign(this, _link);
  }

  fetch(params: Params = {}, options?: RequestInit): Promise<Resource> {
    let uri = uriTemplate(this._link.href).fillFromObject(params);

    options = defaultsDeep({}, DEFAULT_REQUEST_OPTIONS, options, this.config && {
      headers: this.config.requestHeaders
    });

    return fetch(uri, options)
      .then(resp => handleResponse(resp, this.config));
  }

  href: string;
  templated?: boolean;
  name?: string;
}
