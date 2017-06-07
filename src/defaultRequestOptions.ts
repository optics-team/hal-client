import { defaultsDeep } from 'lodash';

export const defaultRequestOptions = (options?: RequestInit) => {
  options = defaultsDeep({}, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/hal+json'
    }
  }, options);

  let token = localStorage.getItem('token');
  if (token) {
    options['headers'].Authorization = `Bearer ${token}`;
  }

  return options;
}
