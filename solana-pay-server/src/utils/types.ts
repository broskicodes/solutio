export const ICON_URI = "";

export type B64TransactionString = string;

export interface SpGetReturnType {
  label: string;
  icon: string;
}

export interface SpPostReturnType {
  transaction: B64TransactionString;
  messgae?: string;
}

export interface SolutioRequestParams {
  taOwner: string;
  receiver: string;
  mint: string;
}
