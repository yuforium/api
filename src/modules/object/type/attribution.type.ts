import { Types } from 'mongoose';

export type Attribution = {
  /**
   * Type of relationship between the object and the actor.
   */
  rel: 'attributedTo' | 'to' | 'cc' | 'bcc' | 'audience' | 'context';

  /**
   * The internal Object ID for the actor that is attributed to the object.
   */
  _id: Types.ObjectId;

  id: string;
  description?: string;
  primary?: boolean;
}
