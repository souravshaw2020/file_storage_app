import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// 1. Define the exact shape of the data we attached in the AuthGuard
export interface JwtPayload {
  sub: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    // 2. Explicitly type the request object so ESLint knows .user exists
    const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();

    // 3. ESLint is happy because it knows this is strictly a JwtPayload
    return request.user;
  },
);
