import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator(
  (field: string | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    if (field) {
      return { [field]: req.user[field] };
    }
    return req.user;
  },
);
