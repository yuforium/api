import { resolveDomain } from '../../../common/decorators/service-domain.decorator';

// @todo - for now this is any, but will be a class with validation
export class ExternalActorDto {
  id!: string;
  public readonly _local = false;
  public get _domain(): string {
    const url = new URL(this.id);
    return resolveDomain(url.hostname);
  }
}