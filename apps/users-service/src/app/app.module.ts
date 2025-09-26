import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import path from 'path';
import { ConfigFor } from '@sample/config';

@Module({
  imports: [
    ConfigFor(path.join(__dirname, '..', '..')),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
