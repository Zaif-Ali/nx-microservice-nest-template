import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICES_CLIENTS, SkipEnvelope } from '@sample/common';
import { Logger } from 'nestjs-pino';

@Controller('users')
export class UserController {
  constructor(
    @Inject(MICROSERVICES_CLIENTS.USERS_SERVICE)
    private readonly usersServiceClient: ClientProxy,
    private readonly logger: Logger
  ) {}

  @Get('me')
  // @SkipEnvelope()
  getMe() {
    this.logger.log('getMe');
    return this.usersServiceClient.send('user.get_profile', { userId: 1 });
  }
}
