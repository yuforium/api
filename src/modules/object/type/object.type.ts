import { ASObjectOrLink } from '@yuforium/activity-streams';

/**
 * ObjectType defines the properties that are required for an object to be stored in the database.
 */
export type ObjectType = {
  '@context': string | string[];
  id: string;
  type: string;
  attributedTo?: ASObjectOrLink | ASObjectOrLink[];
  to?: ASObjectOrLink | ASObjectOrLink[];
  cc?: ASObjectOrLink | ASObjectOrLink[];
  bcc?: ASObjectOrLink | ASObjectOrLink[];
  content?: string | string[];
  name?: string;
}
