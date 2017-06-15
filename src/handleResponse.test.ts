import { handleResponse } from './handleResponse';
import { Resource } from './Resource';
import 'whatwg-fetch';

describe('when response contains an error code', () => {
  it('throws an error containing status code', () => {
    var response = new Response(null, {
      status: 401
    });

    expect(() => handleResponse(response)).toThrow('401');
  });
});

describe('when response is empty', () => {
  it('creates an empty Resource using response headers', async () => {
    var response = new Response(null, {
      headers: {
        Location: '/test/12'
      }
    });

    var resource = await handleResponse(response);

    expect(resource.config.headers.get('Location')).toEqual('/test/12');

    expect(resource.properties).toEqual({});
  });
});

describe('when response contains body', () => {
  it('creates populated Resource', async () => {
    var response = new Response(JSON.stringify({ name: 'Test Person' }));

    var resource = await handleResponse(response);

    expect(resource.properties).toEqual({
      name: 'Test Person'
    });
  });
});
