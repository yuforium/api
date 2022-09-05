import { Injectable } from '@nestjs/common';
import { ActivityDto } from 'src/modules/activity/dto/activity.dto';

/**
 * Service responsible for interacting with (sending and receiving activities) to remote services
 * Also used to fetch remote objects
 */
@Injectable()
export class ActivityPubService {
  public async dispatch(activity: ActivityDto) {
    const obj = activity.object;
    const to = obj.to ? Array.isArray(obj.to) ? obj.to : [obj.to] : [];

    to.forEach(recipient => {
      if (recipient === 'https://www.w3.org/ns/activitystreams#Public') {
        return;
      }
    })
    // iterate through the "to" field, and send the activity to each of the services
    // scenarios -
    // to self
    // to users on same service
    // to user on another service
  }
}
