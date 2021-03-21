export class ClientError extends Error {
  constructor(...params: any[]) {
    super(...params);
    this.name = 'ClientError';
  }
}
