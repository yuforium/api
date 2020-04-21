import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiHeader, ApiProduces } from '@nestjs/swagger';

@ApiTags("app", "service")
@Controller()
export class AppController 
{
	constructor (private readonly appService: AppService, config: ConfigService) {}

	@ApiProduces("application/ld+json; profile=\"https://www.w3.org/ns/activitystreams\"", "application/activity+json")
	@Get()
	public getService ()
	{
		const siteId = process.env.SERVICE_ID, siteName = process.env.SERVICE_NAME

		return {
			type:      "Service",
			id:        siteId,
			name:      siteName,
			inbox:     `${siteId}/inbox`,
			outbox:    `${siteId}/outbox`,
			following: `${siteId}/following`,
			followers: `${siteId}/follwers`,
			liked:     `${siteId}/liked`,

			streams:
			[
				`${siteId}/top/forums`,
				`${siteId}/top/users`,
				`${siteId}/trending/forums`,
				`${siteId}/trending/users`
			]
		}
	}
}
