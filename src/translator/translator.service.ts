import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTranslatorDto } from './dto/create-translator.dto';
import { UpdateTranslatorDto } from './dto/update-translator.dto';
import { TranslateUtil } from "../utils/translate.util";
import { ChargeOrderStatusEnum } from '../enums/charge-order-status.enum';
import { ConfigService } from '@nestjs/config';
import { CustomerCaseStatusEnum, isCaseOpen } from '../enums/customer-case-status.enum';
import { isShippingOrderOpen, ShippingOrderStatusEnum } from '../enums/shipping-order-status.enum';
import { ServiceRequestStatusEnum, isServiceRequestOpen } from '../enums/service-request-status.enum';
import { ServiceOrderStatusEnum } from '../enums/service-order-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { TranslatorEntity } from './entities/translator.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
@Injectable()
export class TranslatorService {
    constructor(
        @InjectRepository(TranslatorEntity) private readonly translatorRepository: Repository<TranslatorEntity>,

        private configService: ConfigService,
        private translateUtil: TranslateUtil,
    ) {
    }
  create(createTranslatorDto: CreateTranslatorDto) {
    try {
      const newTranslate = this.translatorRepository.create(createTranslatorDto);

      return this.translatorRepository.save(newTranslate);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Failed to create a new user');
    }
  }

  findAll() {
   return this.translatorRepository.find();
  }

  async findOne(id: number) {
    try {
      return await this.translatorRepository.findOneByOrFail({ id });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`Translator with ID ${id} not found`);
      }
      throw error; // For other unexpected errors
    }
  }

  update(id: number, updateTranslatorDto: UpdateTranslatorDto) {
    return `This action updates a #${id} translator`;
  }

  remove(id: number) {
    return `This action removes a #${id} translator`;
  }

  translate(entity: any, updateValues: object, parameters: string[]) {

      // return this.translateUtil.generateScript(entity, updateValues, parameters);
    }

    investigate(claims: any, ticket_name: string,) {
        const investigationResults = [];
        let scenario: string;
        const updatedBy: string = `${this.configService.get('APP_USER')}-${ticket_name}`;
        const updateSqlScripts = [];
        const entityUpdates = [];

        for (const claim of claims) {
            for (const serviceRequest of claim.serviceRequests) {
                // Handle Hung Claim
                if (!this.isClaimOpen(claim, serviceRequest)) {
                    const customerCaseStatusUpdateValue: string = this.hasCompletedServiceRequest(claim.serviceRequests)
                        ? CustomerCaseStatusEnum.COMPLETE
                        : CustomerCaseStatusEnum.CANCEL;
                    let serviceRequestUpdateStatus: string = '';

                    switch (serviceRequest.SERVICE_REQUEST_STATUS_CODE) {
                        case ServiceRequestStatusEnum.FAILED:
                            if (serviceRequest.serviceOrders.length <= 0) {
                                serviceRequestUpdateStatus = ServiceRequestStatusEnum.CANCEL;
                                scenario = 'FAILED SR w/o SO';
                            }
                            break;
                        case ServiceRequestStatusEnum.UNSUCCESSFUL:
                            if(serviceRequest.serviceOrders.length <= 0 ) {
                                scenario = `UNSUC SR w/ ${claim.CUSTOMER_CASE_STATUS_CODE} Case`;
                                serviceRequestUpdateStatus = ServiceRequestStatusEnum.CANCEL;
                            }
                            scenario = `UNSUC SR w/ ${claim.CUSTOMER_CASE_STATUS_CODE} Case`;
                            break;
                        case ServiceRequestStatusEnum.VOID:
                            scenario = `VOID SR w/ ${claim.CUSTOMER_CASE_STATUS_CODE} Case`;
                            break;
                        case ServiceRequestStatusEnum.PENDING_VOID:
                            serviceRequestUpdateStatus = ServiceRequestStatusEnum.VOID;
                            scenario = `PNDVOID SR w/ ${claim.CUSTOMER_CASE_STATUS_CODE} Case`;
                            break;
                        default:
                            scenario = `Case ${claim.CUSTOMER_CASE_STATUS_CODE} SR ${serviceRequest.SERVICE_REQUEST_STATUS_CODE} - Undefined Scenario`;
                    }

                    // Generate script to update Case
                    if (isCaseOpen(claim.CUSTOMER_CASE_STATUS_CODE)) {
                        updateSqlScripts.push(
                            this.translateUtil.generateScript(
                                'CustomerCaseEntity',
                                {CUSTOMER_CASE_STATUS_CODE: customerCaseStatusUpdateValue, BULK_UPDATED_BY: updatedBy},
                                {
                                    CUSTOMER_CASE_STATUS_CODE: claim.CUSTOMER_CASE_STATUS_CODE,
                                    BULK_UPDATED_BY: updatedBy
                                },
                                [claim.CUSTOMER_CASE_ID],
                            ),
                        );
                    }

                    // Generate update script to update SR
                    if (
                        (serviceRequestUpdateStatus &&
                        ![
                            ServiceRequestStatusEnum.VOID,
                            ServiceRequestStatusEnum.COMPLETE,
                        ].includes(serviceRequest.SERVICE_REQUEST_STATUS_CODE))
                        || (serviceRequest.serviceOrders.length <= 0 && serviceRequest.SERVICE_REQUEST_STATUS_CODE == ServiceRequestStatusEnum.UNSUCCESSFUL)
                    ) {
                        updateSqlScripts.push(
                            this.translateUtil.generateScript(
                                'ServiceRequestEntity',
                                {SERVICE_REQUEST_STATUS_CODE: serviceRequestUpdateStatus, BULK_UPDATED_BY: updatedBy},
                                {
                                    SERVICE_REQUEST_STATUS_CODE: serviceRequest.SERVICE_REQUEST_STATUS_CODE,
                                    BULK_UPDATED_BY: updatedBy
                                },
                                [serviceRequest.SERVICE_REQUEST_ID],
                            ),
                        );
                    }
                } else {
                    // Handle Uncancelled OSR
                    if (this.isUncancelledOSRClaim(serviceRequest.serviceOrders)) {
                        scenario = 'Uncancelled OSR Claim';
                        // this.claimService.updateAllClaimEntity(c)
                        // Cancel CustomerCase
                        updateSqlScripts.push(
                            this.translateUtil.generateScript(
                                'CustomerCaseEntity',
                                {CUSTOMER_CASE_STATUS_CODE: CustomerCaseStatusEnum.CANCEL, BULK_UPDATED_BY: updatedBy},
                                {
                                    CUSTOMER_CASE_STATUS_CODE: claim.CUSTOMER_CASE_STATUS_CODE,
                                    BULK_UPDATED_BY: updatedBy
                                },
                                [claim.CUSTOMER_CASE_ID],
                            ),
                        );

                        // Cancel ServiceRequest
                        updateSqlScripts.push(
                            this.translateUtil.generateScript(
                                'ServiceRequestEntity',
                                {
                                    SERVICE_REQUEST_STATUS_CODE: ServiceRequestStatusEnum.CANCEL,
                                    BULK_UPDATED_BY: updatedBy
                                },
                                {
                                    SERVICE_REQUEST_STATUS_CODE: serviceRequest.SERVICE_REQUEST_STATUS_CODE,
                                    BULK_UPDATED_BY: updatedBy
                                },
                                [serviceRequest.SERVICE_REQUEST_ID],
                            ),
                        );

                        // Cancel ServiceOrder
                        updateSqlScripts.push(
                            this.translateUtil.generateScript(
                                'ServiceOrderEntity',
                                {
                                    SERVICE_ORDER_STATUS_CODE: ServiceOrderStatusEnum.CANCELLED,
                                    BULK_UPDATED_BY: updatedBy
                                },
                                {
                                    SERVICE_ORDER_STATUS_CODE:
                                    serviceRequest.serviceOrders[serviceRequest?.serviceOrders.length - 1].SERVICE_ORDER_STATUS_CODE,
                                    BULK_UPDATED_BY: updatedBy,
                                },
                                [serviceRequest.serviceOrders[serviceRequest?.serviceOrders.length - 1].SERVICE_ORDER_ID],
                            ),
                        );

                        // Cancel ServiceOrderLines
                        const serviceOrderLineIds = serviceRequest.serviceOrders[
                        serviceRequest?.serviceOrders.length - 1
                            ].serviceOrderLines.reduce((ids, serviceOrderLine) => {
                            if (serviceOrderLine.SERVICE_ORDER_LINE_STATUS_CODE === ServiceOrderStatusEnum.NEW) {
                                ids.push(serviceOrderLine.SERVICE_ORDER_LINE_ID);
                            }
                            return ids;
                        }, []);

                        updateSqlScripts.push(
                            this.translateUtil.generateScript(
                                'ServiceOrderLineEntity',
                                {
                                    SERVICE_ORDER_LINE_STATUS_CODE: ServiceOrderStatusEnum.CANCELLED,
                                    BULK_UPDATED_BY: updatedBy
                                },
                                {
                                    SERVICE_ORDER_LINE_STATUS_CODE: ServiceOrderStatusEnum.NEW,
                                    BULK_UPDATED_BY: updatedBy,
                                },
                                serviceOrderLineIds,
                            ),
                        );

                        // Cancel Charge Order
                        const chargeOrderData = serviceRequest.chargeOrders.reduce(
                            (data, chargeOrder) => {
                                if (
                                    ![
                                        ChargeOrderStatusEnum.CANCEL,
                                        ChargeOrderStatusEnum.CANCELLED,
                                        ChargeOrderStatusEnum.CANCEL_SYSTEM,
                                        ChargeOrderStatusEnum.CHARGED,
                                    ].includes(chargeOrder.CHARGE_ORDER_STATUS_CODE)
                                ) {
                                    data.chargeOrderIds.push(chargeOrder.CHARGE_ORDER_ID);
                                    data.chargeOrderLineIds = chargeOrder.chargeOrderLines.map(
                                        (chargeOrderLine) => chargeOrderLine.CHARGE_ORDER_LINE_ID,
                                    );
                                    data.statusCode = chargeOrder.CHARGE_ORDER_STATUS_CODE;
                                }
                                return data;
                            },
                            {chargeOrderIds: [], statusCode: '', chargeOrderLineIds: []},
                        );

                        if (chargeOrderData.chargeOrderIds.length >= 1) {
                            updateSqlScripts.push(
                                this.translateUtil.generateScript(
                                    'ChargeOrderEntity',
                                    {
                                        CHARGE_ORDER_STATUS_CODE: ChargeOrderStatusEnum.CANCEL,
                                        BULK_UPDATED_BY: updatedBy
                                    },
                                    {
                                        CHARGE_ORDER_STATUS_CODE: chargeOrderData.statusCode,
                                        BULK_UPDATED_BY: updatedBy,
                                    },
                                    chargeOrderData.chargeOrderIds,
                                ),
                            );
                        }

                        if (chargeOrderData.chargeOrderLineIds.length >= 1) {
                            updateSqlScripts.push(
                                this.translateUtil.generateScript(
                                    'ChargeOrderLinesEntity',
                                    {
                                        CHARGE_ORDER_LINE_STATUS_CODE: ChargeOrderStatusEnum.CANCEL,
                                        BULK_UPDATED_BY: updatedBy
                                    },
                                    {
                                        CHARGE_ORDER_LINE_STATUS_CODE: chargeOrderData.statusCode,
                                        BULK_UPDATED_BY: updatedBy,
                                    },
                                    chargeOrderData.chargeOrderLineIds,
                                ),
                            );
                        }

                        // Cancel ShippingOrder
                        const shippingOrderData = serviceRequest.shippingOrders.reduce(
                            (data, shippingOrder) => {
                                if (isShippingOrderOpen(shippingOrder.SHIPPING_STATUS_CODE)) {
                                    data.ids.push(shippingOrder.SHIPPING_ORDER_ID);
                                    data.statusCode = shippingOrder.SHIPPING_STATUS_CODE;
                                }
                                return data;
                            },
                            {ids: [], statusCode: ''},
                        );

                        if (shippingOrderData.ids.length >= 1) {
                            updateSqlScripts.push(
                                this.translateUtil.generateScript(
                                    'ShippingOrderEntity',
                                    {SHIPPING_STATUS_CODE: ShippingOrderStatusEnum.CANCEL, BULK_UPDATED_BY: updatedBy},
                                    {
                                        SHIPPING_STATUS_CODE: shippingOrderData.statusCode,
                                        BULK_UPDATED_BY: updatedBy,
                                    },
                                    shippingOrderData.ids,
                                ),
                            );
                        }
                    }
                }
                investigationResults.push({
                    mdn: claim.CUSTOMER_CASE_NBR,
                    scenario,
                });
            }
        }

        return {
            investigationResults: investigationResults.filter((v, i, a) => a.findIndex(t => JSON.stringify(t) === JSON.stringify(v)) === i),
            updateSqlScripts,
        };
    }

    isUncancelledOSRClaim(serviceOrders): boolean {
        const repairServiceOrderTypeCodes = ['CIS', 'OSR', 'DPM', 'MIR'];

        if (serviceOrders.length >= 1) {
            const lastServiceOrder = serviceOrders[serviceOrders?.length - 1];
            const previousServiceOrder = serviceOrders[serviceOrders?.length - 2];
            const isLastServiceOrderAnOnsiteRepairOrder: boolean =
                lastServiceOrder.SERVICE_ORDER_STATUS_CODE === ServiceOrderStatusEnum.NEW &&
                lastServiceOrder.SERVICE_ORDER_TYPE_CODE === 'OSR';

            const isPreviousServiceOrderACancelledRepairOrder: boolean = previousServiceOrder
                ? isLastServiceOrderAnOnsiteRepairOrder &&
                previousServiceOrder.SERVICE_ORDER_STATUS_CODE === ServiceOrderStatusEnum.CANCELLED &&
                repairServiceOrderTypeCodes.includes(previousServiceOrder.SERVICE_ORDER_TYPE_CODE)
                : false;

            return previousServiceOrder ? isPreviousServiceOrderACancelledRepairOrder : isLastServiceOrderAnOnsiteRepairOrder;
        }

        return false;
    }

    hasCompletedServiceRequest(serviceRequests): boolean {
        const completeSRStatuses: ServiceRequestStatusEnum[] = [
            ServiceRequestStatusEnum.COMPLETE,
            ServiceRequestStatusEnum.UNSUCCESSFUL,
            ServiceRequestStatusEnum.PRODUCT_RETURN,
            ServiceRequestStatusEnum.PRODUCT_RETURN_FIRST_DUP,
            ServiceRequestStatusEnum.PRODUCT_RETURN_SECOND_DUP,
        ];

        return serviceRequests.length <= 0
            ? false
            : serviceRequests.some((row) => completeSRStatuses.includes(row.SERVICE_REQUEST_STATUS_CODE));
    }

    isClaimOpen(claim, serviceRequest): boolean {
        return (
            isCaseOpen(claim.CUSTOMER_CASE_STATUS_CODE) && isServiceRequestOpen(serviceRequest.SERVICE_REQUEST_STATUS_CODE)
        );
    }
}
