export interface IActivationTokenPayload {
  sub: number;
  type: 'activation';
  iat: number;
  exp: number;
}
