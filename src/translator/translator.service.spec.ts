import { Test, TestingModule } from '@nestjs/testing';
import { TranslatorService } from './translator.service';
import { DatasourceService } from './datasource.service';
import { TranslateUtil } from '../utils/translate.util';
import { UnauthorizedException } from '@nestjs/common';

describe('TranslatorService', () => {
    let translatorService: TranslatorService;
    let datasourceService: DatasourceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TranslatorService,
                TranslateUtil,
                {
                    provide: DatasourceService,
                    useValue: {
                        getDataSource: jest.fn().mockImplementation((client) => {
                            if (['us', 'rus'].includes(client)) {
                                return {
                                    getRepository: jest.fn().mockImplementation((entity) => {
                                        return {
                                            createQueryBuilder: jest.fn(() => ({
                                                update: jest.fn().mockReturnThis(),
                                                set: jest.fn(function (updateValues) {
                                                    this.updateValues = updateValues;
                                                    return this;
                                                }),
                                                where: jest.fn(function (condition) {
                                                    this.condition = condition;
                                                    return this;
                                                }),
                                                getQueryAndParameters: jest.fn(function () {
                                                    const tableName = this.metadata.tableName || 'mock_table';
                                                    const primaryColumn = this.metadata.primaryColumns[0].propertyName;
                                                    const ids = this.condition.match(/\((.*?)\)/)[1].split(',').map(id => id.trim().replace(/'/g, ''));

                                                    // Create the SQL statement dynamically based on provided `updateValues`
                                                    const updates = Object.entries(this.updateValues || {}).map(([column, value]) => {
                                                        return `${column} = ${TranslateUtil.formatValue(value)}`;
                                                    }).join(', ');

                                                    const sql = `UPDATE ${tableName} SET BULK_UPDATED_DATE = SYSDATE${updates ? `, ${updates}` : ''} WHERE ${primaryColumn} IN (${ids.map(() => '?').join(', ')})`;
                                                    const params = ids;
                                                    return [sql, params];
                                                }),
                                                metadata: entity.metadata,
                                                updateValues: {}, // For holding dynamic update values
                                            })),
                                            metadata: entity.metadata,
                                        };
                                    }),
                                };
                            } else {
                                throw new UnauthorizedException();
                            }
                        }),
                    },
                },
            ],
        }).compile();

        translatorService = module.get<TranslatorService>(TranslatorService);
        datasourceService = module.get<DatasourceService>(DatasourceService);
    });

    it('should generate correct SQL script for US language with dynamic table name', () => {
        const mockEntity = {
            metadata: {
                tableName: 'us_table',
                primaryColumns: [{ propertyName: 'TRANSLATION_ID' }],
            },
        };
        const sql = translatorService.translate('us', 'us', mockEntity, { column1: 'value1' }, ['1', '2', '3']);
        expect(sql).toBe("UPDATE us_table SET BULK_UPDATED_DATE = SYSDATE, column1 = 'value1' WHERE TRANSLATION_ID IN ('1', '2', '3')");
    });

    it('should generate correct SQL script for Russian language with dynamic table name', () => {
        const mockEntity = {
            metadata: {
                tableName: 'rus_table',
                primaryColumns: [{ propertyName: 'TRANSLATION_ID' }],
            },
        };
        const sql = translatorService.translate('rus', 'rus', mockEntity, { column1: 'value1' }, ['4', '5']);
        expect(sql).toBe("UPDATE rus_table SET BULK_UPDATED_DATE = SYSDATE, column1 = 'value1' WHERE TRANSLATION_ID IN ('4', '5')");
    });

    it('should generate dynamic SQL scripts for different entities', () => {
        const entities = [
            { language: 'us', entity: { metadata: { tableName: 'entity1_table', primaryColumns: [{ propertyName: 'TRANSLATION_ID' }] } }, updateValues: { column1: 'value1' }, parameters: ['1', '2', '3'], expected: "UPDATE entity1_table SET BULK_UPDATED_DATE = SYSDATE, column1 = 'value1' WHERE TRANSLATION_ID IN ('1', '2', '3')" },
            { language: 'rus', entity: { metadata: { tableName: 'entity2_table', primaryColumns: [{ propertyName: 'TRANSLATION_ID' }] } }, updateValues: { column2: 'value2' }, parameters: ['4', '5'], expected: "UPDATE entity2_table SET BULK_UPDATED_DATE = SYSDATE, column2 = 'value2' WHERE TRANSLATION_ID IN ('4', '5')" },
            // Add more cases as needed
        ];

        entities.forEach(({ language, entity, updateValues, parameters, expected }) => {
            const sql = translatorService.translate(language, language, entity, updateValues, parameters);
            expect(sql).toBe(expected);
        });
    });
});
