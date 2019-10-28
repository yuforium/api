import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose"
import { Message } from './interfaces/message.interface';

@Injectable()
export class MessagesService 
{
	constructor (@InjectModel("Message") protected readonly messageModel: Model<Message>)
	{
	}

	
}
