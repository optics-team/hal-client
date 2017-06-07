import { defaultRequestOptions } from './defaultRequestOptions';
import { localStorage } from './__mocks__/localStorage';

declare const global: any;
Object.assign(global, { localStorage });

let options = {
  method: 'POST',
  headers: {
    'x-foo': 'bar'
  }
};

it('extends default request options', () => {
  expect(defaultRequestOptions(options)).toEqual({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/hal+json',
      'x-foo': 'bar'
    }
  })
});

it('uses the token stored in localStorage, if specified', () => {
  localStorage.token = 'test';

  expect(defaultRequestOptions(options)).toEqual({
    method: 'POST',
    headers: {
      'Authorization': 'Bearer test',
      'Content-Type': 'application/json',
      'Accept': 'application/hal+json',
      'x-foo': 'bar'
    }
  })
});
