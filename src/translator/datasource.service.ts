import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {InjectDataSource} from "@nestjs/typeorm";

@Injectable()
export class DatasourceService {
    constructor(
        @InjectDataSource('us') private us: DataSource,
        @InjectDataSource('default') private att: DataSource,
        // @Inject('usDataSource') private us: DataSource, // Injecting with custom token
        // @Inject('attDataSource') private att: DataSource,
    ) {}
    getDataSource(client): any {
        switch (client) {
            case 'att':
                return this.att;
            case 'us':
                return this.us;
            default:
                throw new UnauthorizedException;
        }
    }
}
