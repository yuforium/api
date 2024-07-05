import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "ok" status in healthcheck', async () => {
      const result = await appController.getHealthCheck();
      expect(result).toHaveProperty('status', 'ok');
      expect(typeof result).toBe('object');
    });

    it('should return a valid response for root application', async () => {
      const result = await appController.getService('localhost');
      expect(result).toHaveProperty('id', 'https://localhost');
      expect(result).toHaveProperty('type', 'Application');
    });
  });
});
