import { Injectable } from '@nestjs/common';
import { StreamProcessor } from '../interfaces/stream-processor.interface';
import { SyncActivityStreamService } from './sync-activity-stream.service';

@Injectable()
export class StreamService extends SyncActivityStreamService implements StreamProcessor {
}
