export type B64TransactionString = string;

export interface SpGetReturnType {
  label: string;
  icon: string;
}

export interface SpPostReturnType {
  transaction: B64TransactionString;
  messgae?: string;
}
