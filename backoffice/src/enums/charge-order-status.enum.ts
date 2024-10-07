export enum ChargeOrderStatusEnum {
  NEW = 'NEW',
  PREAUTHORIZED = 'PREAUTH',
  PENDING = 'PNDG',
  PENDING_DUP = 'PENDING',
  CHARGED = 'CHRGD',
  NO_CHARGE_REQUIRED = 'NCR',
  WAIVED = 'WVD',
  CANCELLED = 'CANCELLED',
  INVOICED = 'INVOICED',
  CANCEL_SYSTEM = 'CNCLSYS',
  CANCELLED_BY_SYSTEM = 'CBS',
  CANCELLED_BY_USER = 'CBU',
  CANCELLED_FIRST_DUP = 'CNCLD',
  CANCEL = 'CNCL',
}

export function isChargeOrderOpen(status: string): boolean {
  return [
    ChargeOrderStatusEnum.PENDING_DUP,
    ChargeOrderStatusEnum.PENDING,
    ChargeOrderStatusEnum.PREAUTHORIZED,
    ChargeOrderStatusEnum.NEW,
  ].includes(status as ChargeOrderStatusEnum);
}
