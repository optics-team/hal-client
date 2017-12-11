import { handleResponse, HTTPError } from './handleResponse';
import { Resource } from './Resource';
import 'whatwg-fetch';

describe('when response contains an error code', () => {
  it('rejects with an error containing status code and response body', () => {
    const body = {
      message: 'whoops',
      attributes: {
        foo: 'bar'
      }
    };

    var response = new Response(JSON.stringify(body), {
      status: 422,
      statusText: 'Unprocessable Entity'
    });

    return handleResponse(response)
      .catch((err: HTTPError) => {
        expect(err.message).toEqual('Unprocessable Entity');
        expect(err.status).toEqual(422);
        expect(err.body).toEqual(body);
      });
  });

  it('rejects with an error containing a plain string', () => {
    const body = 'whoops';

    var response = new Response(JSON.stringify(body), {
      status: 422,
      statusText: 'Unprocessable Entity'
    });

    return handleResponse(response)
      .catch((err: HTTPError) => {
        expect(err.message).toEqual('Unprocessable Entity');
        expect(err.status).toEqual(422);
        expect(err.body).toEqual(body);
      });
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
