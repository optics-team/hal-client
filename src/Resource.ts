import { Link, RawLink } from './Link';
import { Form, RawForm } from './Form';

/**
 * Returns the type of a property named `K` from type `U` if it has been defined
 * on `U`, otherwise return the type of the same property from type `T`.
 *
 * This is the type-system equivalent of something like:
 * ```
 *   const foo = options && options.foo || defaults.foo
 * ```
 */
type Default<T, U extends Partial<T>, K extends keyof T> =
  null extends U[K] ? T[K] : U[K];

type Properties<M extends PartialResourceModel> =
  Default<ResourceModel, M, 'properties'>;

type Meta<M extends PartialResourceModel> =
  Default<ResourceModel, M, 'meta'>;

type Embedded<M extends PartialResourceModel> =
  Default<ResourceModel, M, 'embedded'>;

type EmbeddedKey<M extends PartialResourceModel> =
  keyof Embedded<M>;

type EmbeddedValue<M extends PartialResourceModel, K extends EmbeddedKey<M>> =
  Embedded<M>[K];

export interface ResourceModel {
  properties: {
    [key: string]: any
  }

  meta: {
    [key: string]: any
  },

  embedded: {
    [key: string]: Resource | Resource[]
  }
}

type PartialResourceModel = Partial<ResourceModel>;

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

export class Resource<M extends PartialResourceModel = ResourceModel>{
  public readonly properties: Properties<M>;
  public readonly meta: Meta<M>;

  protected _links: {
    [rel: string]: RawLink | RawLink[]
  }

  protected _forms: {
    [rel: string]: RawForm | RawForm[]
  }

  protected _embedded: {
    [rel in EmbeddedKey<M>]: RawResource | RawResource[]
  }

  constructor(resource: RawResource, public config: Partial<ResourceConfig> = {}) {
    Object.assign(this, metaProperties(resource));

    this._links = resource._links || {};
    this._forms = resource._forms || {};
    this._embedded = resource._embedded || {} as any;
  }

  protected _hasIn(type: '_links' | '_forms', rel: string): boolean;
  protected _hasIn(type: '_embedded', rel: EmbeddedKey<M>): boolean;
  protected _hasIn(type: string, rel: any) {
    return rel in this[type as keyof this];
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

  hasEmbedded(rel: EmbeddedKey<M>) {
    return this._hasIn('_embedded', rel);
  }

  embedded<K extends EmbeddedKey<M>>(rel: K): EmbeddedValue<M, K> {
    if (!this.hasEmbedded(rel)) {
      throw Error(`Embed '${rel}' does not exist`);
    }

    var embedded = this._embedded[rel];
    if (embedded instanceof Array) {
      return embedded.map(embed => new Resource(embed, this.config)) as any;
    }

    return new Resource(embedded, this.config) as any;
  }
}

const metaProperties = <M>(resource: RawResource) => {
  const properties = {} as Properties<M>;
  const meta = {} as Meta<M>;
  const keys = Object.keys(resource);

  let i = keys.length;
  while (i--) {
    const key = keys[i];

    if (key[0] === '_') {
      const metaKey = key.slice(1, key.length) as keyof Meta<M>;
      meta[metaKey] = resource[key];
    } else {
      properties[key as keyof Properties<M>] = resource[key];
    }
  }

  return { properties, meta };
}
