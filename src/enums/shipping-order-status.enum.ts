export enum ShippingOrderStatusEnum {
  NEW = 'NEW',
  VERIFIED = 'VRFD',
  LABEL_GENERATED = 'LBGNRTD',
  READY = 'READY',
  IN_TRANSIT = 'INTRNS',
  BACKORDER_RELEASED = 'BORDREL',
  CANCELLED = 'CANCELLED',
  PRODUCT_RETURN = 'PRDRTRN',
  COMPLETE = 'CMPLTD',
  CANCEL_SYSTEM = 'CNCLSYS',
  RECEIVED = 'RCVD',
  SHIP = 'SHIP',
  DELIVERED = 'DLVRD',
  FAILED = 'FAILED',
  CANCEL = 'CANCL',
  CANCEL_DUP = 'CNCL',
}

export function isShippingOrderOpen(status: string): boolean {
  return [
    ShippingOrderStatusEnum.NEW,
    ShippingOrderStatusEnum.VERIFIED,
    ShippingOrderStatusEnum.LABEL_GENERATED,
    ShippingOrderStatusEnum.READY,
    ShippingOrderStatusEnum.IN_TRANSIT,
    ShippingOrderStatusEnum.BACKORDER_RELEASED,
  ].includes(status as ShippingOrderStatusEnum);
}
