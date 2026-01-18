import 'express-serve-static-core';
import { Tenant } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    tenant?: Tenant;
    params: Record<string, string>;
    query: Record<string, string | undefined>;
  }
}
