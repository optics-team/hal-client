import { pickBy, map } from 'ramda';
import { Link, RawLink } from './Link';
import { Form, RawForm } from './Form';

export interface RawResource {
  [property: string]: any,

  _links?: {
    [rel: string]: RawLink | RawLink[]
  },

  _embedded?: {
    [rel: string]: RawResource | RawResource[]
  },

  _forms?: {
    [rel: string]: RawForm | RawForm[]
  }
}

export interface ResourceConfig {
  headers: Headers,
  requestHeaders: Headers
}

export class Resource {
  public readonly properties: {
    [key: string]: any
  }

  public readonly meta: {
    [key: string]: any
  }

  protected _links: {
    [rel: string]: RawLink | RawLink[]
  }

  protected _forms: {
    [rel: string]: RawForm | RawForm[]
  }

  protected _embedded: {
    [rel: string]: RawResource | RawResource[]
  }

  constructor(resource: RawResource, public config: Partial<ResourceConfig> = {}) {
    this.properties = pickBy((value, key) => key[0] !== '_', resource);

    this._links = resource._links || {};
    this._forms = resource._forms || {};
    this._embedded = resource._embedded || {};

    this.meta = {};
    Object.keys(resource)
      .filter(key => key[0] === '_')
      .forEach(key => {
        var stripped = key.slice(1, key.length);
        this.meta[stripped] = resource[key];
      });
  }

  protected _hasIn(type: '_links' | '_forms' | '_embedded', rel: string) {
    return rel in this[type];
  }

  protected _hasNamedIn(type: '_links' | '_forms', rel: string, name: string) {
    if (!this._hasIn(type, rel)) {
      return false;
    }

    var items = this[type][rel];
    if (items instanceof Array) {
      return !!(items as Array<RawLink | RawForm>).find(item => item.name === name);
    }

    return items.name === name;
  }

  hasLink(rel: string) {
    return this._hasIn('_links', rel);
  }

  hasLinkNamed(rel: string, name: string) {
    return this._hasNamedIn('_links', rel, name);
  }

  link(rel: string) {
    if (!this.hasLink(rel)) {
      throw Error(`Link '${rel}' does not exist`);
    }

    var link = this._links[rel];
    if (link instanceof Array) {
      throw Error(`Multiple Links with rel '${rel}', use 'linkNamed(rel, name)' instead`);
    }

    return new Link(link, this.config);
  }

  linkNamed(rel: string, name: string) {
    if (!this.hasLinkNamed(rel, name)) {
      throw Error(`Link '${rel}:${name}' does not exist`);
    }

    var links = this._links[rel];
    if (!(links instanceof Array)) {
      return new Link(links, this.config);
    }

    return new Link(links.find(link => link.name === name) as RawLink, this.config);
  }

  hasForm(rel: string) {
    return this._hasIn('_forms', rel);
  }

  hasFormNamed(rel: string, name: string) {
    return this._hasNamedIn('_forms', rel, name);
  }

  form(rel: string) {
    if (!this.hasForm(rel)) {
      throw Error(`Form '${rel}' does not exist`);
    }

    var form = this._forms[rel];
    if (form instanceof Array) {
      throw Error(`Multiple Forms with rel '${rel}', use 'formNamed(rel, name)' instead`);
    }

    return new Form(form, this.config);
  }

  formNamed(rel: string, name: string) {
    if (!this.hasFormNamed(rel, name)) {
      throw Error(`Form '${rel}:${name}' does not exist`);
    }

    var forms = this._forms[rel];
    if (!(forms instanceof Array)) {
      return new Form(forms, this.config);
    }

    return new Form(forms.find(form => form.name === name) as RawForm, this.config);
  }

  hasEmbedded(rel: string) {
    return this._hasIn('_embedded', rel);
  }

  embedded(rel: string) {
    if (!this.hasEmbedded(rel)) {
      throw Error(`Embed '${rel}' does not exist`);
    }

    var embedded = this._embedded[rel];
    if (embedded instanceof Array) {
      return embedded.map(embed => new Resource(embed, this.config));
    }

    return new Resource(embedded, this.config);
  }
}
