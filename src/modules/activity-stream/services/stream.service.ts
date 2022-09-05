import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Activity } from '@yuforium/activity-streams-validator';
import { StreamProcessor } from '../interfaces/stream-processor.interface';
import { SyncActivityStreamService } from './sync-activity-stream.service';

@Injectable()
export class StreamService extends SyncActivityStreamService implements StreamProcessor {
  public async consume(activity: Activity) { }
  public async dispatch(activity: Activity) { }
}
