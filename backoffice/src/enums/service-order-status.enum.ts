export enum ServiceOrderStatusEnum {
  NEW = 'NEW',
  ACCEPTED = 'ACCEPTED',
  READY = 'READY',
  BACK_ORDERED = 'BORD',
  OUT_OF_STOCK = 'OOS',
  PENDING = 'PENDING',
  BACKORDER_RELEASED = 'BORDREL',
  CANCEL = 'CNCL',
  UNSUCCESSFUL = 'UNSUC',
  OVERRIDE = 'OVERRIDE',
  REPLACEMENT_UNSUCCESSFUL = 'REPLUNSUC',
  RETURN_PRODUCT_UNSUCCESSFUL = 'RPRUNSUC',
  REJECTED = 'REJECTED',
  RECEIVED = 'RCVD',
  PRODUCT_RETURN = 'PRDRTRN',
  SHIPPED = 'SHIPPED',
  NO_RETURN = 'NORPR',
  CANCEL_SYSTEM = 'CNCLSYS',
  COMPLETE = 'CMPLTD',
  PRODUCT_RETURN_FIRST_DUP = 'PRDRTN',
  EXPIRED = 'EXPIRED',
  REPAIR_NOT_DONE = 'RPRNTDN',
  PRODUCT_RETURN_SECOND_DUP = 'PRDTRTN',
  CANCELLED = 'CANCELLED',
  ALL_CANCEL = 'ALLCNCL',
}

export function isServiceOrderOpen(status: string): boolean {
  return [
    ServiceOrderStatusEnum.NEW,
    ServiceOrderStatusEnum.ACCEPTED,
    ServiceOrderStatusEnum.READY,
    ServiceOrderStatusEnum.BACK_ORDERED,
    ServiceOrderStatusEnum.OUT_OF_STOCK,
    ServiceOrderStatusEnum.PENDING,
    ServiceOrderStatusEnum.BACKORDER_RELEASED,
  ].includes(status as ServiceOrderStatusEnum);
}
