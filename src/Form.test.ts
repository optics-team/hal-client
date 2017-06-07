import { Form } from './Form';
import { Resource } from './Resource';
import { localStorage } from './__mocks__/localStorage';

declare var require: any;
const fetch = require('jest-fetch-mock');

declare const global: any;
Object.assign(global, { localStorage, fetch });

const schema = {
  properties: {
    name: {
      type: 'string'
    },
    age: {
      type: 'number'
    },
    enabled: {
      type: 'boolean'
    }
  },
  required: ['name', 'age', 'enabled']
};

describe('#submit()', () => {
  describe('when method is `PATCH`', () => {
    let form = new Form({
      name: 'test',
      href: '/test/{id}',
      method: 'PATCH',
      schema: {
        ...schema,
        default: {
          name: 'Test Person',
          age: 35,
          enabled: true
        }
      }
    });

    it('only submits values which are different from schema defaults', async () => {
      await form.submit({ enabled: false }, { id: 12 });

      expect(fetch).toHaveBeenLastCalledWith('/test/12', {
        method: 'PATCH',
        body: JSON.stringify({ enabled: false }),
        headers: jasmine.any(Object)
      });
    });

    it('parses result as a Resource', async () => {
      var resource = await form.submit({ enabled: false }, { id: 12 });
      expect(resource).toBeInstanceOf(Resource);
    });
  });

  describe('when method is `POST`', () => {
    let form = new Form({
      name: 'test',
      href: '/test',
      method: 'POST',
      schema
    });

    it('submits all values', async () => {
      await form.submit({ name: 'New Person', age: 32, enabled: false });

      expect(fetch).toHaveBeenLastCalledWith('/test', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Person',
          age: 32,
          enabled: false
        }),
        headers: jasmine.any(Object)
      });
    });

    it('parses result as a Resource', async () => {
      var resource = await form.submit({ enabled: false }, { id: 12 });
      expect(resource).toBeInstanceOf(Resource);
    });
  });

  describe('when method is `PUT`', () => {
    let form = new Form({
      name: 'test',
      href: '/test',
      method: 'PUT',
      schema: {
        ...schema,
        default: {
          name: 'Test Person',
          age: 32,
          enabled: false
        }
      }
    });

    it('submits all values, merged with schema defaults', async () => {
      await form.submit({ age: 22 });

      expect(fetch).toHaveBeenLastCalledWith('/test', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Test Person',
          age: 22,
          enabled: false
        }),
        headers: jasmine.any(Object)
      });
    });

    it('parses result as a Resource', async () => {
      var resource = await form.submit({ enabled: false }, { id: 12 });
      expect(resource).toBeInstanceOf(Resource);
    });
  });

  describe('when method is `DELETE`', () => {
    it('submits an empty body', async () => {
      let form = new Form({
        name: 'test',
        href: '/test/12',
        method: 'DELETE',
      });

      await form.submit();

      expect(fetch).toHaveBeenLastCalledWith('/test/12', {
        method: 'DELETE',
        headers: jasmine.any(Object)
      });
    });
  });
})
