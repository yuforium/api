import { ObjectType } from './object.type';

export type RelationshipType = ObjectType & {
  subject: string;
  object: string;
  relationship: string;
};
