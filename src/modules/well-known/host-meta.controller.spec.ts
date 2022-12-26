import { Test, TestingModule } from '@nestjs/testing';
import { HostMetaController } from './host-meta.controller';

describe('HostMetaController', () => {
  let controller: HostMetaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HostMetaController],
    }).compile();

    controller = module.get<HostMetaController>(HostMetaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
