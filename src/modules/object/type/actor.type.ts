import { ActorDto } from '../dto/actor/actor.dto';
import { DtoType } from './dto.type';
import { ObjectType } from './object.type';

// export type ActorType = ObjectType & {
//   preferredUsername: string;

//   publicKey?: {
//     id: string;
//     owner: string;
//     publicKeyPem: string;
//   }
// };

export type ActorType = DtoType<ActorDto>;
