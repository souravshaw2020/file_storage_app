import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Secure File Storage API is running and healthy!';
  }
}
