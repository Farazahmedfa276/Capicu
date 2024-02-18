import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: unknown, input: ExecutionContext) => {
    const request = input.switchToHttp().getRequest();
    return request.user;
  },
);
