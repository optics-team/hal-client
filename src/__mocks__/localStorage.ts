export const localStorage = {
  token: undefined as (string | undefined),

  getItem() {
    return this.token;
  }
};
