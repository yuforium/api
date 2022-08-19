import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

/**
 * Inbox service. Handles inbox-related activities, including validation and processing.
 */
@Injectable()
export class InboxService {

  constructor(@InjectConnection() protected connection: Connection) { }

  public async processActivity(activity: any) {
    const session = await this.connection.startSession();
    const type: 'create'|'update'|'delete' = activity.type.toLowerCase();
    const allowedTypes = ['create', 'update', 'delete'];

    if (allowedTypes.indexOf(type) === -1) {
      throw new NotImplementedException(`Unsupported activity type: ${type}`);
    }

    return await this[type](activity);
  }

  protected async create(activity: any) {

  }

  protected async update() {

  }

  protected async delete() {
  }
}
