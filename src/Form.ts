import * as uriTemplate from 'uri-templates';
import { defaultsDeep } from 'lodash';
import { equals } from 'ramda';
import { Resource } from './Resource';
import { Params } from './Link';
import { handleResponse } from './handleResponse';

export interface Data {
  [key: string]: string | number | boolean
}

export interface Property {
  type: string;
  format?: string;
  readOnly?: boolean;
  enum?: any[];
}

export interface Schema {
  properties: {
    [key: string]: Property
  },

  required: string[];

  default?: {
    [key: string]: any
  }
}

export interface RawForm {
  name: string,
  href: string,
  method: string,
  schema?: Schema
}

export interface FormConfig {
  requestHeaders: Headers
}

const DEFAULT_REQUEST_OPTIONS = {
  headers: {
    'Content-Type': 'application/json'
  }
};

export class Form {
  constructor(protected _form: RawForm, public config: Partial<FormConfig> = {}) { }

  diff(data: Data = {}, original: Data = {}): Data {
    let diff: Data = {};

    Object.keys(data)
      .forEach(key => {
        if (!(key in original) || !equals(data[key], original[key])) {
          diff[key] = data[key];
        }
      })

    return diff;
  }

  submit(data?: Data, params?: Params, options?: RequestInit): Promise<Resource> {
    if (this._form.method === 'PATCH') {
      data = this.diff(data, this._form.schema && this._form.schema.default);
    }

    if (this._form.method === 'POST' || this._form.method === 'PUT') {
      data = {
        ...this._form.schema && this._form.schema.default,
        ...data
      }
    }

    let uri = uriTemplate(this._form.href).fillFromObject(params || {});

    options = defaultsDeep(
      {},
      DEFAULT_REQUEST_OPTIONS,
      options,
      {
        method: this._form.method,
      },
      this.config && {
        headers: this.config.requestHeaders
      },
      data && {
        body: JSON.stringify(data)
      }
    );

    return fetch(uri, options)
      .then(handleResponse);
  }
}
