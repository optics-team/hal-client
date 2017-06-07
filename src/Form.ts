import * as uriTemplate from 'uri-templates';
import { equals } from 'ramda';
import { Resource } from './Resource';
import { Params } from './Link';
import { defaultRequestOptions } from './defaultRequestOptions';
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

export class Form {
  constructor(protected _form: RawForm) { }

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

    options = {
      ...defaultRequestOptions(options),
      method: this._form.method,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    return fetch(uri, options)
      .then(handleResponse);
  }
}
