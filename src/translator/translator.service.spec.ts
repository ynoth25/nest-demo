import { Test, TestingModule } from '@nestjs/testing';
import { TranslatorService } from './translator.service';
import { DatasourceService } from './datasource.service';
import { TranslateUtil } from '../utils/translate.util';
import { ConfigService } from "@nestjs/config";
import * as ClaimData  from './FSP_259601-test-data.json';
describe('TranslatorService', () => {
    let translatorService: TranslatorService;
    let translateUtil: TranslateUtil;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TranslatorService,
                TranslateUtil,
                DatasourceService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'APP_USER') {
                                return 'SHERLOCK.USER';
                            }
                            return null;
                        }),
                    },
                },
            ],
        }).compile();

        configService = module.get<ConfigService>(ConfigService);
        translatorService = module.get<TranslatorService>(TranslatorService);
        translateUtil = module.get<TranslateUtil>(TranslateUtil);
    });

    it('FSP_259601 service should be defined', () => {
        expect(translatorService).toBeDefined();
    });

    it('FAILED SR investigation and SQL script (No completed SR)', () => {
        const ticketName = 'SHERLOCK_TICKET';
        const translateSpy = jest.spyOn(translateUtil, 'translate');
        const buildUpdateClauseSpy = jest.spyOn(translateUtil, 'buildUpdateClause');
        const sqlQueries = translatorService.investigate(ClaimData.failedSR, ticketName);

        expect(translateSpy && buildUpdateClauseSpy).toHaveBeenCalledTimes(6);
        expect(sqlQueries).toEqual({
            "investigationResults": [
                {"mdn": "111112222233333", "scenario": "FAILED SR w/o SO"},
                {"mdn": "22222333333444444", "scenario": "FAILED SR w/o SO"}
            ],
            "updateSqlScripts":[
                {
                    "rollbackScript": `UPDATE CUSTOMER.CUSTOMER_CASE SET CUSTOMER_CASE_STATUS_CODE = 'WORKING', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE CUSTOMER_CASE_ID IN ('1AAAAAAAAAAAAAAAAAAAAAAAAAAAA');`,
                    "rolloutScript": `UPDATE CUSTOMER.CUSTOMER_CASE SET CUSTOMER_CASE_STATUS_CODE = 'CNCLSYS', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE CUSTOMER_CASE_ID IN ('1AAAAAAAAAAAAAAAAAAAAAAAAAAAA');`,
                },
                {
                    "rollbackScript": `UPDATE CUSTOMER.SERVICE_REQUEST SET SERVICE_REQUEST_STATUS_CODE = 'FAILED', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_REQUEST_ID IN ('1BAAAAAAAAAAAAAAAAAAAAAAAAAAA');`,
                    "rolloutScript": `UPDATE CUSTOMER.SERVICE_REQUEST SET SERVICE_REQUEST_STATUS_CODE = 'CNCLSYS', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_REQUEST_ID IN ('1BAAAAAAAAAAAAAAAAAAAAAAAAAAA');`,
                },
                {
                    "rollbackScript": `UPDATE CUSTOMER.SERVICE_REQUEST SET SERVICE_REQUEST_STATUS_CODE = 'FAILED', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_REQUEST_ID IN ('2BAAAAAAAAAAAAAAAAAAAAA');`,
                    "rolloutScript": `UPDATE CUSTOMER.SERVICE_REQUEST SET SERVICE_REQUEST_STATUS_CODE = 'CNCLSYS', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_REQUEST_ID IN ('2BAAAAAAAAAAAAAAAAAAAAA');`,
                },
            ],
        })
    });

    it('VOID SR investigation and SQL script (With completed SR)', () => {
        const ticketName = 'SHERLOCK_TICKET';
        const translateSpy = jest.spyOn(translateUtil, 'translate');
        const buildUpdateClauseSpy = jest.spyOn(translateUtil, 'buildUpdateClause');
        const hasCompletedSRSpy = jest.spyOn(translatorService, 'hasCompletedServiceRequest').mockReturnValue(true);
        const sqlQueries = translatorService.investigate(ClaimData.voidSR, ticketName);

        expect(translateSpy && buildUpdateClauseSpy).toHaveBeenCalledTimes(2);
        expect(hasCompletedSRSpy).toHaveBeenCalled();
        expect(hasCompletedSRSpy.mock.results[0].value).toEqual(true);
        expect(sqlQueries).toEqual({
            "investigationResults": [
                {"mdn": "VOID11111111111111222222", "scenario": "VOID SR w/ WORKING Case"},
            ],
            "updateSqlScripts":[
                {
                    "rollbackScript": `UPDATE CUSTOMER.CUSTOMER_CASE SET CUSTOMER_CASE_STATUS_CODE = 'WORKING', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE CUSTOMER_CASE_ID IN ('1AAAAAAAAAAAAAAAAAAAAAAAAAAAA');`,
                    "rolloutScript": `UPDATE CUSTOMER.CUSTOMER_CASE SET CUSTOMER_CASE_STATUS_CODE = 'CMPLTD', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE CUSTOMER_CASE_ID IN ('1AAAAAAAAAAAAAAAAAAAAAAAAAAAA');`,
                },
            ],
        })
    });

    it('PENDING VOID SR investigation and SQL script (With completed SR)', () => {
        const ticketName = 'SHERLOCK_TICKET';
        const translateSpy = jest.spyOn(translateUtil, 'translate');
        const buildUpdateClauseSpy = jest.spyOn(translateUtil, 'buildUpdateClause');
        // const hasCompletedSRSpy = jest.spyOn(translatorService, 'hasCompletedServiceRequest').mockReturnValue(true);
        const sqlQueries = translatorService.investigate(ClaimData.pendingVoidSR, ticketName);

        expect(translateSpy && buildUpdateClauseSpy).toHaveBeenCalledTimes(8);
        // expect(hasCompletedSRSpy).toHaveBeenCalled();
        // expect(hasCompletedSRSpy.mock.results[0].value).toEqual(true);
        expect(sqlQueries).toEqual({
            "investigationResults": [
                {"mdn": "PND11111111111111111111", "scenario": "PNDVOID SR w/ WORKING Case"},
                {"mdn": "PND11111111111111111111", "scenario": "Case WORKING SR CMPLTD - Undefined Scenario"},
                {"mdn": "PND222222222222222222", "scenario": "PNDVOID SR w/ CMPLTD Case"},
            ],
            "updateSqlScripts":[
                {
                    "rollbackScript": `UPDATE CUSTOMER.CUSTOMER_CASE SET CUSTOMER_CASE_STATUS_CODE = 'WORKING', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE CUSTOMER_CASE_ID IN ('1SAAAAAAAAAAAAAAAAAAAAAAAAAAAA');`,
                    "rolloutScript": `UPDATE CUSTOMER.CUSTOMER_CASE SET CUSTOMER_CASE_STATUS_CODE = 'CMPLTD', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE CUSTOMER_CASE_ID IN ('1SAAAAAAAAAAAAAAAAAAAAAAAAAAAA');`,
                },
                {
                    "rollbackScript": `UPDATE CUSTOMER.SERVICE_REQUEST SET SERVICE_REQUEST_STATUS_CODE = 'PNDVOID', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_REQUEST_ID IN ('SR1SAAAAAAAAAAAAAAAAAAAAAAAAAAAA');`,
                    "rolloutScript": `UPDATE CUSTOMER.SERVICE_REQUEST SET SERVICE_REQUEST_STATUS_CODE = 'VOID', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_REQUEST_ID IN ('SR1SAAAAAAAAAAAAAAAAAAAAAAAAAAAA');`,
                },
                {
                    "rollbackScript": `UPDATE CUSTOMER.CUSTOMER_CASE SET CUSTOMER_CASE_STATUS_CODE = 'WORKING', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE CUSTOMER_CASE_ID IN ('1SAAAAAAAAAAAAAAAAAAAAAAAAAAAA');`,
                    "rolloutScript": `UPDATE CUSTOMER.CUSTOMER_CASE SET CUSTOMER_CASE_STATUS_CODE = 'CMPLTD', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE CUSTOMER_CASE_ID IN ('1SAAAAAAAAAAAAAAAAAAAAAAAAAAAA');`,
                },
                {
                    "rollbackScript": `UPDATE CUSTOMER.SERVICE_REQUEST SET SERVICE_REQUEST_STATUS_CODE = 'PNDVOID', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_REQUEST_ID IN ('SR1SSAAAAAAAAAAAAAAAAAAAAAAAAAAAA');`,
                    "rolloutScript": `UPDATE CUSTOMER.SERVICE_REQUEST SET SERVICE_REQUEST_STATUS_CODE = 'VOID', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_REQUEST_ID IN ('SR1SSAAAAAAAAAAAAAAAAAAAAAAAAAAAA');`,
                },
            ],
        })
    });

    it('UNSUC SR investigation and SQL script', () => {
        const ticketName = 'SHERLOCK_TICKET';
        const translateSpy = jest.spyOn(translateUtil, 'translate');
        const buildUpdateClauseSpy = jest.spyOn(translateUtil, 'buildUpdateClause');
        const hasCompletedSRSpy = jest.spyOn(translatorService, 'hasCompletedServiceRequest').mockReturnValue(true);
        const sqlQueries = translatorService.investigate(ClaimData.unsuccessfulSR, ticketName);

        expect(translateSpy && buildUpdateClauseSpy).toHaveBeenCalledTimes(4);
        expect(hasCompletedSRSpy).toHaveBeenCalled();
        expect(hasCompletedSRSpy.mock.results[0].value).toEqual(true);
        expect(sqlQueries).toEqual({
            "investigationResults": [
                {"mdn": "UNSUC-CASE11111", "scenario": "UNSUC SR w/ WORKING Case"},
                {"mdn": "UNSUC-CASE2222222222", "scenario": "UNSUC SR w/ CMPLTD Case"},
            ],
            "updateSqlScripts":[
                {
                    "rollbackScript": `UPDATE CUSTOMER.CUSTOMER_CASE SET CUSTOMER_CASE_STATUS_CODE = 'WORKING', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE CUSTOMER_CASE_ID IN ('UNSUC1AAAAAAAAAAAAAAAAAAAAAAAAAAAA');`,
                    "rolloutScript": `UPDATE CUSTOMER.CUSTOMER_CASE SET CUSTOMER_CASE_STATUS_CODE = 'CMPLTD', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE CUSTOMER_CASE_ID IN ('UNSUC1AAAAAAAAAAAAAAAAAAAAAAAAAAAA');`,
                },
                {
                    "rollbackScript": `UPDATE CUSTOMER.SERVICE_REQUEST SET SERVICE_REQUEST_STATUS_CODE = 'UNSUC', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_REQUEST_ID IN ('2BAAAAAAAAAAAAAAAAAAAAA');`,
                    "rolloutScript": `UPDATE CUSTOMER.SERVICE_REQUEST SET SERVICE_REQUEST_STATUS_CODE = 'CNCLSYS', BULK_UPDATED_BY = '${configService.get('APP_USER')}-${ticketName}', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_REQUEST_ID IN ('2BAAAAAAAAAAAAAAAAAAAAA');`,
                },
            ],
        })
    });

    it('Uncancelled OSR investigation and SQL script', () => {
        const ticketName = 'SHERLOCK_TICKET';
        const translateSpy = jest.spyOn(translateUtil, 'translate');
        const buildUpdateClauseSpy = jest.spyOn(translateUtil, 'buildUpdateClause');
        const isUncancelledOSRClaimSpy = jest.spyOn(translatorService, 'isUncancelledOSRClaim');
        const sqlQueries = translatorService.investigate(ClaimData.unCancelledOSR, ticketName);

        // expect(translateSpy && buildUpdateClauseSpy).toHaveBeenCalledTimes(28);
        expect(isUncancelledOSRClaimSpy).toHaveBeenCalledTimes(2);
        expect(sqlQueries).toEqual({
            "investigationResults": [
                { "mdn": "UNCANCELLEDCASE11111111111111111", "scenario": "Uncancelled OSR Claim"},
                {"mdn": "UNCANCELLED-CASE2222222222222", "scenario": "Uncancelled OSR Claim"},
            ],
            "updateSqlScripts":[
                {
                    "rollbackScript": "UPDATE CUSTOMER.CUSTOMER_CASE SET CUSTOMER_CASE_STATUS_CODE = 'WORKING', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE CUSTOMER_CASE_ID IN ('UNCANCELLED1BBBBBBBBBBBBBBBBBBBBBB');",
                    "rolloutScript": "UPDATE CUSTOMER.CUSTOMER_CASE SET CUSTOMER_CASE_STATUS_CODE = 'CNCLSYS', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE CUSTOMER_CASE_ID IN ('UNCANCELLED1BBBBBBBBBBBBBBBBBBBBBB');",
                },
                {
                    "rollbackScript": "UPDATE CUSTOMER.SERVICE_REQUEST SET SERVICE_REQUEST_STATUS_CODE = 'WORKNG', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_REQUEST_ID IN ('2BBBBBBBBBBBBBBBBBBBBBB');",
                    "rolloutScript": "UPDATE CUSTOMER.SERVICE_REQUEST SET SERVICE_REQUEST_STATUS_CODE = 'CNCLSYS', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_REQUEST_ID IN ('2BBBBBBBBBBBBBBBBBBBBBB');",
                },
                {
                    "rollbackScript": "UPDATE CUSTOMER.SERVICE_ORDER SET SERVICE_ORDER_STATUS_CODE = 'NEW', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_ORDER_ID IN ('1EF59B28D84D0C00986685ASDD4E7672656DSAD');",
                    "rolloutScript": "UPDATE CUSTOMER.SERVICE_ORDER SET SERVICE_ORDER_STATUS_CODE = 'CANCELLED', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_ORDER_ID IN ('1EF59B28D84D0C00986685ASDD4E7672656DSAD');",
                },
                {
                    "rollbackScript": "UPDATE CUSTOMER.SERVICE_ORDER_LINE SET SERVICE_ORDER_LINE_STATUS_CODE = 'NEW', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_ORDER_LINE_ID IN ('1EF59B28D84D0C02986685D4E7672656');",
                    "rolloutScript": "UPDATE CUSTOMER.SERVICE_ORDER_LINE SET SERVICE_ORDER_LINE_STATUS_CODE = 'CANCELLED', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_ORDER_LINE_ID IN ('1EF59B28D84D0C02986685D4E7672656');",
                },
                {
                    "rollbackScript": "UPDATE CUSTOMER.CHARGE_ORDER SET CHARGE_ORDER_STATUS_CODE = 'NCR', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE CHARGE_ORDER_ID IN ('BBD91D3F196546A2A68D856A427BEDA1');",
                    "rolloutScript": "UPDATE CUSTOMER.CHARGE_ORDER SET CHARGE_ORDER_STATUS_CODE = 'CNCL', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE CHARGE_ORDER_ID IN ('BBD91D3F196546A2A68D856A427BEDA1');",
                },
                {
                    "rollbackScript": "UPDATE CUSTOMER.CHARGE_ORDER_LINE SET CHARGE_ORDER_LINE_STATUS_CODE = 'NCR', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE CHARGE_ORDER_LINE_ID IN ('6939670F2B5448078837CA3F1E531A51');",
                    "rolloutScript": "UPDATE CUSTOMER.CHARGE_ORDER_LINE SET CHARGE_ORDER_LINE_STATUS_CODE = 'CNCL', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE CHARGE_ORDER_LINE_ID IN ('6939670F2B5448078837CA3F1E531A51');",
                },
                {
                    "rollbackScript": "UPDATE CUSTOMER.SHIPPING_ORDER SET SHIPPING_STATUS_CODE = 'VRFD', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE SHIPPING_ORDER_ID IN ('1EF59B28EFA60500986685D4E7672656');",
                    "rolloutScript": "UPDATE CUSTOMER.SHIPPING_ORDER SET SHIPPING_STATUS_CODE = 'CANCL', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE SHIPPING_ORDER_ID IN ('1EF59B28EFA60500986685D4E7672656');",
                },
                {
                    "rollbackScript": "UPDATE CUSTOMER.CUSTOMER_CASE SET CUSTOMER_CASE_STATUS_CODE = 'WORKING', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE CUSTOMER_CASE_ID IN ('UNCANCELLED222222222222222222222');",
                    "rolloutScript": "UPDATE CUSTOMER.CUSTOMER_CASE SET CUSTOMER_CASE_STATUS_CODE = 'CNCLSYS', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE CUSTOMER_CASE_ID IN ('UNCANCELLED222222222222222222222');",
                },
                {
                    "rollbackScript": "UPDATE CUSTOMER.SERVICE_REQUEST SET SERVICE_REQUEST_STATUS_CODE = 'WORKNG', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_REQUEST_ID IN ('1EF57781AB5F08819EAF2723086BBF46ttttttsd');",
                    "rolloutScript": "UPDATE CUSTOMER.SERVICE_REQUEST SET SERVICE_REQUEST_STATUS_CODE = 'CNCLSYS', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_REQUEST_ID IN ('1EF57781AB5F08819EAF2723086BBF46ttttttsd');",
                },
                {
                    "rollbackScript": "UPDATE CUSTOMER.SERVICE_ORDER SET SERVICE_ORDER_STATUS_CODE = 'NEW', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_ORDER_ID IN ('1EF59B28D84D0C00986685D4E7672656dsdsdsdasdasd');",
                    "rolloutScript": "UPDATE CUSTOMER.SERVICE_ORDER SET SERVICE_ORDER_STATUS_CODE = 'CANCELLED', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_ORDER_ID IN ('1EF59B28D84D0C00986685D4E7672656dsdsdsdasdasd');",
                },
                {
                    "rollbackScript": "UPDATE CUSTOMER.SERVICE_ORDER_LINE SET SERVICE_ORDER_LINE_STATUS_CODE = 'NEW', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_ORDER_LINE_ID IN ('1EF59B28D84D0C02986685D4E7672656dadasdasd');",
                    "rolloutScript": "UPDATE CUSTOMER.SERVICE_ORDER_LINE SET SERVICE_ORDER_LINE_STATUS_CODE = 'CANCELLED', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE SERVICE_ORDER_LINE_ID IN ('1EF59B28D84D0C02986685D4E7672656dadasdasd');",
                },
                {
                    "rollbackScript": "UPDATE CUSTOMER.CHARGE_ORDER SET CHARGE_ORDER_STATUS_CODE = 'NCR', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE CHARGE_ORDER_ID IN ('BBD91D3F196546A2A68D856A427BEDA1dsdasdasa');",
                    "rolloutScript": "UPDATE CUSTOMER.CHARGE_ORDER SET CHARGE_ORDER_STATUS_CODE = 'CNCL', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE CHARGE_ORDER_ID IN ('BBD91D3F196546A2A68D856A427BEDA1dsdasdasa');",
                },
                {
                    "rollbackScript": "UPDATE CUSTOMER.CHARGE_ORDER_LINE SET CHARGE_ORDER_LINE_STATUS_CODE = 'NCR', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE CHARGE_ORDER_LINE_ID IN ('6939670F2B5448078837CA3F1E531A51dsadsadadsad');",
                    "rolloutScript": "UPDATE CUSTOMER.CHARGE_ORDER_LINE SET CHARGE_ORDER_LINE_STATUS_CODE = 'CNCL', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE CHARGE_ORDER_LINE_ID IN ('6939670F2B5448078837CA3F1E531A51dsadsadadsad');",
                },
                {
                    "rollbackScript": "UPDATE CUSTOMER.SHIPPING_ORDER SET SHIPPING_STATUS_CODE = 'VRFD', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE SHIPPING_ORDER_ID IN ('1EF59B28EFA60500986685D4E7672656dasdasdaaa');",
                    "rolloutScript": "UPDATE CUSTOMER.SHIPPING_ORDER SET SHIPPING_STATUS_CODE = 'CANCL', BULK_UPDATED_BY = 'SHERLOCK.USER-SHERLOCK_TICKET', BULK_UPDATED_DATE = SYSDATE WHERE SHIPPING_ORDER_ID IN ('1EF59B28EFA60500986685D4E7672656dasdasdaaa');",
                },
            ],
        })
    });
});
