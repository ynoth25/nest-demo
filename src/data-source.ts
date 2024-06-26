import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm/data-source';
import { SeederOptions } from 'typeorm-extension';
import { join } from 'path';

const options = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'demo',
    entities: [join(__dirname, '**', '*.entity.{ts,js}')],
    factories: [join(__dirname, './database/factories', '*.{ts,js}')],
    migrations: [join(__dirname, './database/migrations', '*.{ts,js}')],
    migrationsTableName: 'custom_migration_table',
    seeds: [join(__dirname, './database/seeds', '*.{ts,js}')],
    synchronize: false,
    //logging: true,
};

export const AppDataSource = new DataSource(
    options as DataSourceOptions & SeederOptions,
);
