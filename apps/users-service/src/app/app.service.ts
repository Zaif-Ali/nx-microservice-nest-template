import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getProfile(userId: number): { id: string; name: string; email: string } {
    return {
      id: userId.toString(),
      name: 'Guest From Users Service',
      email: 'guest@users.local',
    };
  }

  getAllUsers() {
    return [
      {
        id: '1',
        name: 'Guest From Users Service',
        email: 'guest@users.local',
      },
    ];
  }
}
