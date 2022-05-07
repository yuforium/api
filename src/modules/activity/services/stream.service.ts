import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { StreamProcessor } from '../interfaces/stream-processor.interface';
import { SyncStreamService } from './sync-stream.service';

@Injectable()
export class StreamService extends SyncStreamService implements StreamProcessor {
  public async consume(activity) { }
  public async dispatch(activity) { }
}
