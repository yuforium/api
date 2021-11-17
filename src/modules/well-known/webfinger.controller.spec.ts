import { Test, TestingModule } from '@nestjs/testing';
import { WebfingerController } from './webfinger.controller';

describe('Webfinger Controller', () => {
  let controller: WebfingerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebfingerController],
    }).compile();

    controller = module.get<WebfingerController>(WebfingerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
