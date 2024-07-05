import { Test, TestingModule } from '@nestjs/testing';
import { UserInboxController } from './user-inbox.controller';

describe('UserInbox Controller', () => {
  let controller: UserInboxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserInboxController],
    }).compile();

    controller = module.get<UserInboxController>(UserInboxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
