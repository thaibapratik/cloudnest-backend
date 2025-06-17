import { verifyToken } from '@clerk/backend';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  constructor(
    @Inject('ClerkClient')
    private clerkClient: any,
  ) {
    super();
  }

  async validate(req: any) {
    try {
      const token = req.headers.authorization.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException();
      }
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
        clockSkewInMs: 10000,
      });

      const user = await this.clerkClient.users.getUser(payload.sub);

      return {
        id: user.id,
      };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }
  }
}
