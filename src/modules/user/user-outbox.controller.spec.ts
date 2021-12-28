import { Test, TestingModule } from '@nestjs/testing';
import { UserOutboxController } from './user-outbox.controller';

describe('UserOutbox Controller', () => {
  let controller: UserOutboxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserOutboxController],
    }).compile();

    controller = module.get<UserOutboxController>(UserOutboxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
