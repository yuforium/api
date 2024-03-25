import { Injectable } from '@nestjs/common';
import { ActivityStreams, ASLink, ASObject } from '@yuforium/activity-streams';
import { ObjectService } from '../object.service';

@Injectable()
export class StoredObjectResolver extends ActivityStreams.Resolver {
  constructor(protected objectService: ObjectService) {
    super();
  }

  public async handle(request: string): Promise<string | ASObject | ASLink> {
    const obj = await this.objectService.findOne({id: request});
    return obj || request;
  }
}
