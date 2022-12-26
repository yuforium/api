import { Injectable } from '@nestjs/common';
import { APActivity } from './outbox.service';

@Injectable()
export class OutboxProcessorService {
  public async create<T extends APActivity = APActivity>(dto: T) {
    return dto;
  }
}
