import { Controller, Get, Inject } from '@nestjs/common';
import { MICROSERVICES_CLIENTS } from '../../constant';
import { ClientProxy } from '@nestjs/microservices';

@Controller('users')
export class UserController {
  constructor(
    @Inject(MICROSERVICES_CLIENTS.USERS_SERVICE)
    private readonly usersServiceClient: ClientProxy
  ) {}

  @Get('me')
  getMe() {
    return this.usersServiceClient.send('user.get_profile', { userId: 1 });
  }
}
