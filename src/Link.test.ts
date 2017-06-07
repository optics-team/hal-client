import { Link } from './Link';
import { Resource } from './Resource';
import { localStorage } from './__mocks__/localStorage';

declare var require: any;
const fetch = require('jest-fetch-mock');

declare const global: any;
Object.assign(global, { localStorage, fetch });

describe('#fetch()', () => {
  let link = new Link({
    href: '/test/{id}'
  });

  it('fills parameters and fetches from `href`', async () => {
    await link.fetch({ id: 12 });
    expect(fetch).toHaveBeenCalledWith('/test/12', jasmine.any(Object));
  });

  it('parses result as a Resource', async () => {
    let resource = await link.fetch({ id: 12 });

    expect(resource).toBeInstanceOf(Resource);
  })
});
