import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ServiceDomain } from 'src/common/decorators/service-domain.decorator';

@Controller('topics')
export class TopicController {
  @ApiOperation({ operationId: 'getTopic', summary: 'Get topic' })
  @ApiParam({
    name: 'topicname',
    type: String,
    required: true,
    example: 'general'
  })
  @ApiOkResponse({
    description: 'User content'
  })
  @Get(':topicname')
  public async getTopic(
    @ServiceDomain() domain: string,
    @Param() params: { topicname: string }
  ) {
    return {
      '@context': [
        'https://www.w3.org/ns/activitystreams',
        'https://yuforium.com/ns/activitystreams'
      ],
      id: `https://example.com/topics/${params.topicname}`,
      type: ['Service', 'Topic'],
      name: params.topicname,
      preferredUsername: params.topicname,
      inbox: `https://${domain}/topics/${params.topicname}/inbox`,
      outbox: `https://${domain}/topics/${params.topicname}/outbox`,
      followers: `https://${domain}/topics/${params.topicname}/followers`,
      following: `https://${domain}/topics/${params.topicname}/following`
    };
  }
}
