class ClientError extends Error {
  constructor(...params) {
    super(...params);
    this.name = 'ClientError';
  }
}

module.exports = ClientError;
