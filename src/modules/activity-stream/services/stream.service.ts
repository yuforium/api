import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ASActivity } from '@yuforium/activity-streams';
import { StreamProcessor } from '../interfaces/stream-processor.interface';
import { SyncActivityStreamService } from './sync-activity-stream.service';

@Injectable()
export class StreamService extends SyncActivityStreamService implements StreamProcessor {
  public async consume(activity: ASActivity) { }
  public async dispatch(activity: ASActivity) { }
}
