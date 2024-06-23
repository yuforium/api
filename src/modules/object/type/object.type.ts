import { ASObjectOrLink } from '@yuforium/activity-streams';

/**
 * ObjectType defines the minimal properties that are required for an object to be stored in the database.
 * This differs from the ObjectRecord definition which also defines the schema and metadata for the object.
 */
export type ObjectType = {
  '@context': string | string[];
  id: string;
  type: string | string[];
  summary?: string | string[];
  attributedTo?: ASObjectOrLink | ASObjectOrLink[];
  to?: ASObjectOrLink | ASObjectOrLink[];
  cc?: ASObjectOrLink | ASObjectOrLink[];
  bcc?: ASObjectOrLink | ASObjectOrLink[];
  content?: string | string[];
  name?: string;
  audience?: ASObjectOrLink | ASObjectOrLink[];
}
