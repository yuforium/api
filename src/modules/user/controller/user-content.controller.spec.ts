import { Test, TestingModule } from '@nestjs/testing';
import { UserContentController } from './user-content.controller';

describe('ContentController', () => {
  let controller: UserContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserContentController],
    }).compile();

    controller = module.get<UserContentController>(UserContentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
