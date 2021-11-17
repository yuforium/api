import { Test, TestingModule } from '@nestjs/testing';
import { WebfingerService } from './webfinger.service';

describe('WebfingerService', () => {
  let service: WebfingerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebfingerService],
    }).compile();

    service = module.get<WebfingerService>(WebfingerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
