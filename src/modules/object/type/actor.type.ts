import { ObjectType } from './object.type';

export type ActorType = ObjectType & {
  preferredUsername: string;

  publicKey?: {
    id: string;
    owner: string;
    publicKeyPem: string;
  }
};
