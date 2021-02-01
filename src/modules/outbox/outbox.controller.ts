import { Controller, Get, Post } from '@nestjs/common';

@Controller('outbox')
export class OutboxController {
  @Get()
  public async getOutbox() {
    return {
      "@context": "https://www.w3.org/ns/activitystreams",
      "summary": "Outbox",
      "type": "OrderedCollection",
      "totalItems": 2,
      "orderedItems": [
        {
          "type": "Note",
          "name": "A Simple Note"
        },
        {
          "type": "Note",
          "name": "Another Simple Note"
        }
      ]
    };
  }

  @Post() 
  public async postOutbox() {
    return {};
  }
}
