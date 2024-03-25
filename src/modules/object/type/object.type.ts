import { ASObjectOrLink } from '@yuforium/activity-streams';

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
