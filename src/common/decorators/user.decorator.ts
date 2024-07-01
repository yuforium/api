import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type allowedUserFields = 'preferredUsername';

export const User = createParamDecorator(
  (data: allowedUserFields, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.user) {
      return null;
    }

    const user = request.user;

    if (data) {
      return user[data];
    }

    return user;
  }
);
