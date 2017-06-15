import { Resource } from './Resource';
import { Link } from './Link';
import { Form } from './Form';
import 'whatwg-fetch';

var _links = {
  self: {
    href: '/test/12'
  },
  groups: [{
    href: '/groups',
    name: 'all'
  }, {
    href: '/groups/12',
    name: 'primary'
  }],
  profile: {
    name: 'default',
    href: '/test/12/profile/default'
  }
}

var _forms = {
  self: [{
    name: 'update',
    href: '/test/12',
    method: 'PATCH'
  }, {
    name: 'delete',
    href: '/test/12',
    method: 'DELETE'
  }],
  system: {
    name: 'backup',
    href: '/backups',
    method: 'POST'
  }
}

var _embedded = {
  starred: [{
    name: 'Favourite #1',
    order: 1
  }, {
    name: 'Favourite #2',
    order: 10
  }],

  manager: {
    name: 'Test Manager'
  }
}

var resource = new Resource({
  name: 'Test Resource',
  _enabled: true,
  _links,
  _forms,
  _embedded
});

describe('constructor', () => {
  it('extracts raw object to properties, meta-properties, links, forms and embeds', () => {
    expect(resource.properties).toEqual({
      name: 'Test Resource'
    });

    expect(resource.meta).toEqual({
      enabled: true,
      links: _links,
      forms: _forms,
      embedded: _embedded
    });
  });

  it('extracts Location header if set', () => {
    var resource = new Resource({}, {
      headers: new Headers({
        Location: '/test/12'
      })
    });

    expect(resource.config.headers.get('Location')).toBe('/test/12');
  });
});

describe('#hasLink()', () => {
  it('finds one link by `rel`', () => {
    expect(resource.hasLink('self')).toBe(true);
    expect(resource.hasLink('other')).toBe(false);
  });
});

describe('#hasLinkNamed()', () => {
  it('finds one link by `rel` and `name`', () => {
    expect(resource.hasLinkNamed('groups', 'all')).toBe(true);
    expect(resource.hasLinkNamed('groups', 'any')).toBe(false);

    expect(resource.hasLinkNamed('self', 'all')).toBe(false);
    expect(resource.hasLinkNamed('other', 'any')).toBe(false);
  });
});

describe('#link()', () => {
  it('returns Link instance matching `rel`', () => {
    var link = resource.link('self');

    expect(link).toBeInstanceOf(Link);
    expect(link).toEqual(new Link(_links.self, {}));
  });

  it('throws if `rel` does not exist', () => {
    expect(() => resource.link('other')).toThrow("Link 'other' does not exist");
  });

  it('throws if multiple links with `rel` are found', () => {
    expect(() => resource.link('groups')).toThrow("Multiple Links with rel 'groups', use 'linkNamed(rel, name)' instead");
  });
});

describe('#linkNamed()', () => {
  it('returns Link instances matching `rel` and `name`', () => {
    var link = resource.linkNamed('groups', 'primary');

    expect(link).toBeInstanceOf(Link);
    expect(link).toEqual(new Link(_links.groups[1], {}));
  });

  it('returns Link instances matching `rel` and `name` when only one exists', () => {
    var link = resource.linkNamed('profile', 'default');

    expect(link).toBeInstanceOf(Link);
    expect(link).toEqual(new Link(_links.profile, {}));
  });

  it('throws if `rel:name` does not exist', () => {
    expect(() => resource.linkNamed('groups', 'any')).toThrow("Link 'groups:any' does not exist");
  });
});

describe('#hasForm()', () => {
  it('finds one form by `rel`', () => {
    expect(resource.hasForm('system')).toBe(true);
    expect(resource.hasForm('other')).toBe(false);
  });
});

describe('#hasFormNamed()', () => {
  it('finds one form by `rel` and `name`', () => {
    expect(resource.hasFormNamed('self', 'update')).toBe(true);
    expect(resource.hasFormNamed('self', 'create')).toBe(false);

    expect(resource.hasFormNamed('system', 'update')).toBe(false);
    expect(resource.hasFormNamed('other', 'any')).toBe(false);
  });
});

describe('#form()', () => {
  it('returns Form instance matching `rel`', () => {
    var form = resource.form('system');

    expect(form).toBeInstanceOf(Form);
    expect(form).toEqual(new Form(_forms.system, {}));
  });

  it('throws if `rel` does not exist', () => {
    expect(() => resource.form('other')).toThrow("Form 'other' does not exist");
  });

  it('throws if multiple forms with `rel` are found', () => {
    expect(() => resource.form('self')).toThrow("Multiple Forms with rel 'self', use 'formNamed(rel, name)' instead");
  });
});

describe('#formNamed()', () => {
  it('returns Form instances matching `rel` and `name`', () => {
    var form = resource.formNamed('self', 'delete');

    expect(form).toBeInstanceOf(Form);
    expect(form).toEqual(new Form(_forms.self[1], {}));
  });

  it('returns Form instances matching `rel` and `name` when only one exists', () => {
    var form = resource.formNamed('system', 'backup');

    expect(form).toBeInstanceOf(Form);
    expect(form).toEqual(new Form(_forms.system, {}));
  });

  it('throws if `rel:name` does not exist', () => {
    expect(() => resource.formNamed('self', 'create')).toThrow("Form 'self:create' does not exist");
  });
});

describe('#hasEmbedded()', () => {
  it('finds one embed by `rel`', () => {
    expect(resource.hasEmbedded('starred')).toBe(true);
    expect(resource.hasEmbedded('others')).toBe(false);
  });
});

describe('#embedded()', () => {
  it('returns embedded Resource instance matching `rel`', () => {
    var manager = resource.embedded('manager') as Resource;
    expect(manager).toBeInstanceOf(Resource);
    expect(manager.properties).toEqual(_embedded.manager);
  });

  it('returns an array of embdedded Resources matching `rel`', () => {
    var starred = resource.embedded('starred') as Resource[];
    expect(starred).toHaveLength(2);

    expect(starred[0]).toBeInstanceOf(Resource);
    expect(starred[0].properties).toEqual(_embedded.starred[0]);
  });
});
