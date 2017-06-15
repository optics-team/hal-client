import { Link } from './Link';
import { Resource } from './Resource';

declare const require: any;
declare const global: any;
Object.assign(global, { fetch: require('jest-fetch-mock') });

describe('#fetch()', () => {
  let link = new Link({
    href: '/test/{id}'
  });

  it('fills parameters and fetches from `href`', async () => {
    await link.fetch({ id: 12 });
    expect(fetch).toHaveBeenCalledWith('/test/12', {
      headers: {
        Accept: 'application/hal+json'
      }
    });
  });

  it('parses result as a Resource', async () => {
    let resource = await link.fetch({ id: 12 });

    expect(resource).toBeInstanceOf(Resource);
  });

  it('merges `config` when fetching', async () => {
    link.config = {
      requestHeaders: {
        Authorization: 'Bearer test-token'
      }
    };

    await link.fetch({ id: 12 });

    expect(fetch).toHaveBeenCalledWith('/test/12', {
      headers: {
        Accept: 'application/hal+json',
        Authorization: 'Bearer test-token'
      }
    });
  })
});
