import { Test, TestingModule } from '@nestjs/testing';
import { OutboxController } from './outbox.controller';

describe('UserOutbox Controller', () => {
  let controller: OutboxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OutboxController],
    }).compile();

    controller = module.get<OutboxController>(OutboxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
