import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICES_CLIENTS, SkipEnvelope } from '@sample/common';

@Controller('users')
export class UserController {
  constructor(
    @Inject(MICROSERVICES_CLIENTS.USERS_SERVICE)
    private readonly usersServiceClient: ClientProxy
  ) {}

  @Get('me')
  // @SkipEnvelope()
  getMe() {
    return this.usersServiceClient.send('user.get_profile', { userId: 1 });
  }
}
