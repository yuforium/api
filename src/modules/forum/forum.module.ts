import { Module } from '@nestjs/common';
import { ForumService } from './services/forum.service';
import { ForumController } from './controllers/forum.controller';
import { TypegooseModule } from 'nestjs-typegoose';
import { Forum } from './models/forum.model';

@Module({
  controllers: [ForumController],

  imports: [
    TypegooseModule.forFeature([Forum]),
  ],

  providers: [ForumService]
})
export class ForumModule 
{
}
