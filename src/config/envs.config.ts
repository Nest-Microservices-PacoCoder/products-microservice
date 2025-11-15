import 'dotenv/config';
import envVar from 'env-var';

export const envs = {
  port: envVar.get('PORT').required().asPortNumber(),
  DATABASE_URL: envVar.get('DATABASE_URL').required().asString(),
};
