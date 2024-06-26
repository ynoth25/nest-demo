import { DataSource } from 'typeorm';
import { runSeeders, Seeder, SeederFactoryManager } from 'typeorm-extension';
import { AppDataSource } from '../../data-source';
import userFactory from '../factories/user.factory';
import UserSeeder from './user.seeder';

export default class MainSeeder implements Seeder {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager,
    ): Promise<any> {
        await runSeeders(dataSource, {
            seeds: [
                UserSeeder
            ],
            factories: [
                userFactory,
            ],
        });
    }
}

async function run() {
    const connection = await AppDataSource.connect();
    const factoryManager = new SeederFactoryManager();

    const seeder = new MainSeeder();
    await seeder.run(AppDataSource, factoryManager);

    await connection.close();
}

run().catch((error) => console.error(error));
