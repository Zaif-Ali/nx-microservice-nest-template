import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('user.get_profile')
  getProfile(user: { userId: number }) {
    return this.appService.getProfile(user.userId);
  }

  @MessagePattern('user.get_all_users')
  getAllUsers(){
    return this.appService.getAllUsers();
  }
}
