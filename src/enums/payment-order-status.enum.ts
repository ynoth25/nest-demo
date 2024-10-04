export enum PaymentOrderStatusEnum {
  PENDING_APPROVAL = 'PNDAVL',
  APPROVED = 'APPD',
  PAID = 'PAID',
  CANCEL_SYSTEM = 'CNCLSYS',
  DECLINED = 'DCLND',
  CANCELLED = 'CNCL',
  PAYMENT_PENDING = 'PAYPNDG',
  CANCEL = 'CANCL',
  NEW = 'NEW',
  CANCEL_PENDING = 'CNCLPNDNG',
}

export function isPaymentOrderOpen(status: string): boolean {
  return [
    PaymentOrderStatusEnum.PENDING_APPROVAL,
    PaymentOrderStatusEnum.APPROVED,
    PaymentOrderStatusEnum.PAYMENT_PENDING,
    PaymentOrderStatusEnum.NEW,
  ].includes(status as PaymentOrderStatusEnum);
}
