import { Test, TestingModule } from '@nestjs/testing';
import { resolveDomain, ServiceDomainDecorator } from './service-domain.decorator';

describe('ServiceDomain', () => {
  const nodeEnv = process.env.NODE_ENV;
  let decorator: ServiceDomainDecorator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceDomainDecorator
      ]
    }).compile();

    decorator = module.get<ServiceDomainDecorator>(ServiceDomainDecorator);
  });

  afterEach(() => {
    process.env.NODE_ENV = nodeEnv;
  });

  it('should be defined', () => {
    expect(decorator).toBeDefined();
  });

  it('should resolve a domain', () => {
    const result = resolveDomain('www.yuforium.com');
    expect(result).toBe('yuforium.com');
  });

  it('should resolve localhost in development', () => {
    process.env.NODE_ENV = 'development';
    const result = resolveDomain('localhost');
    expect(result).toBe('localhost');
  });

  it('should throw an error for localhost in production', () => {
    expect(() => {
      resolveDomain('localhost');
    }).toThrow('not a valid name');
  });
});
