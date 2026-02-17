import { Request } from 'express';
import { UserType } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        userType: UserType;
        email: string;
      };
    }
  }
}
