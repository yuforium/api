import { ObjectType } from './object.type';

export type UserActorType = ObjectType & {
  preferredUsername: string;
  inbox: string;
  outbox: string;
  followers: string;
  following: string;
};
