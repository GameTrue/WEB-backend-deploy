import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

config();

const getTypeOrmConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    migrationsTableName: 'migrations',
    migrations: [__dirname + '/../migrations/CreateInitialSchema.{ts,js}', __dirname + '/../migrations/AddSessionsTable.{ts,js}'], 
    migrationsRun: true,
    autoLoadEntities: true,
    
    // SSL configuration for Render
    ssl: {
      rejectUnauthorized: false
    },
    
    // Connection handling
    retryAttempts: 10,
    retryDelay: 3000,
    connectTimeoutMS: 20000,
    keepConnectionAlive: true,
    
    logging: ['error', 'migration', 'schema'],
  };
};

export default getTypeOrmConfig;
