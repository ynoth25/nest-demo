export enum CustomerCaseStatusEnum {
  WORKING = 'WORKING',
  REOPEN = 'REOPEN',
  NEW = 'NEW',
  COMPLETE = 'CMPLTD',
  CANCEL = 'CNCLSYS',
  CANCEL_USER = 'CNCLUS',
  CANCEL_AGENT = 'CNCLAGENT',
}

export const isCaseOpen = (status: string): boolean => {
  return [
    CustomerCaseStatusEnum.WORKING,
    CustomerCaseStatusEnum.REOPEN,
    CustomerCaseStatusEnum.NEW,
  ].includes(status as CustomerCaseStatusEnum);
};
