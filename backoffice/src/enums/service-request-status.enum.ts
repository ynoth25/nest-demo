export enum ServiceRequestStatusEnum {
  WORKING = 'WORKNG',
  PENDING_VOID = 'PNDVOID',
  NEW = 'NEW',
  HOLD = 'HOLD',
  PRODUCT_RETURN = 'PRDTRTN',
  COMPLETE = 'CMPLTD',
  PRODUCT_RETURN_FIRST_DUP = 'PRDRTN',
  CANCEL = 'CNCLSYS',
  DISCLAIMED = 'DISCLAIMED',
  CANCEL_USER = 'CNCLCUS',
  PRODUCT_RETURN_SECOND_DUP = 'PRDRTRN',
  CANCEL_SYSTEM_FIRST_DUP = 'CNLCSYS',
  VOID = 'VOID',
  UNSUCCESSFUL = 'UNSUC',
  CANCEL_AGENT = 'CNCLAGENT',
  FAILED = 'FAILED',
  SUCCESSFUL = 'SUCCESSFUL',
}

export function isServiceRequestOpen(status: string): boolean {
  return [ServiceRequestStatusEnum.WORKING, ServiceRequestStatusEnum.HOLD, ServiceRequestStatusEnum.NEW].includes(
    status as ServiceRequestStatusEnum,
  );
}
