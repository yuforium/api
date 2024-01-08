export interface AcceptOptions {
  requestSignature?: {
    headers: {
      [key: string]: string | string[] | undefined;
    };
    publicKey?: string;
    method: string;
    path: string;
  }
}