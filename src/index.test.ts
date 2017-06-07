import { Resource } from './Resource';
import { Link } from './Link';
import { Form } from './Form';
import * as HALClient from './index';

it('re-exports Resource, Link and Form', () => {
  expect(HALClient.Resource).toBe(Resource);
  expect(HALClient.Link).toBe(Link);
  expect(HALClient.Form).toBe(Form);
});
