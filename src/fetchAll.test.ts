import { fetchAll } from './fetchAll';
import { Link } from './Link';
import { Resource } from './Resource';

declare const require: any;
declare const global: any;
Object.assign(global, { fetch: require('jest-fetch-mock') });

const mockResponses = (pages: any[]) => {
  const responses = pages.map(page => ([
    JSON.stringify(page),
  ]));

  global.fetch.mockResponses(...responses);
}

const pages = [{
  count: 4,
  _links: {
    next: {
      href: '/widgets?page=2'
    }
  },
  _embedded: {
    widgets: [{
      name: 'widget 1'
    }, {
      name: 'widget 2'
    }]
  }
}, {
  count: 4,
  _links: {
    next: {
      href: '/widgets?page=3'
    }
  },
  _embedded: {
    widgets: [{
      name: 'widget 3'
    }]
  }
}, {
  count: 4,
  _embedded: {
    widgets: [{
      name: 'widget 4'
    }]
  }
}]

it('fetches all embedded resources across multiple pages', async () => {
  mockResponses(pages);

  const result = await fetchAll(new Link({ href: '/widgets' }), { embed: 'widgets' });

  expect(result).toEqual({
    total: 4,
    items: [
      new Resource({ name: 'widget 1' }, jasmine.any(Object)),
      new Resource({ name: 'widget 2' }, jasmine.any(Object)),
      new Resource({ name: 'widget 3' }, jasmine.any(Object)),
      new Resource({ name: 'widget 4' }, jasmine.any(Object))
    ]
  });
});

it('calls a progress callback on every page', async () => {
  mockResponses(pages);

  const progress = jest.fn();

  await fetchAll(new Link({ href: '/widgets' }), {
    embed: 'widgets',
    progress
  });

  expect(progress.mock.calls).toEqual([
    [4, 2],
    [4, 3],
    [4, 4]
  ]);
});

describe('when a page does not contain the specified embed', () => {
  it('does append anything to the result set', async () => {
    const emptyPage = {
      count: 4,
      _links: {
        next: {
          href: '/widgets?page=2'
        }
      },
    };

    mockResponses([emptyPage, ...pages]);

    const result = await fetchAll(new Link({ href: '/widgets' }), { embed: 'widgets' });

    expect(result).toEqual({
      total: 4,
      items: [
        new Resource({ name: 'widget 1' }, jasmine.any(Object)),
        new Resource({ name: 'widget 2' }, jasmine.any(Object)),
        new Resource({ name: 'widget 3' }, jasmine.any(Object)),
        new Resource({ name: 'widget 4' }, jasmine.any(Object))
      ]
    });
  });
});
