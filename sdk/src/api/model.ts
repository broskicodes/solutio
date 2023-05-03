
export interface PaymentDTO {
  paymentId: string;
  appName: string;
  receiver: string;
  mint: string;
  amount: number;
  // threadSchedule?: ConvertableString;
  // delegateAmount?: number;
}

export interface PaymentLink {
  url: string;
  id: string;
}