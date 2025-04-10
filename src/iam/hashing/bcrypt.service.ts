import { Injectable } from '@nestjs/common';
import { HashingService } from './hashing.service';
import { compare } from 'bcrypt';

@Injectable()
export class BcryptService implements HashingService {
  async hash(data: string | Buffer): Promise<string> {
    const bcrypt = await import('bcrypt');
    const saltRounds = 10;
    return bcrypt.hash(data.toString(), saltRounds);
  }

  compare(data: string | Buffer, encrypted: string): Promise<boolean> {
    return compare(data, encrypted);
  }
}
