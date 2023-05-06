# Solutio

Solutio is suite of tools that make it easy to accept USDC payments for any product of service offered online.

### Features
- Third party payments provider that manages all blockchain interaction
- Typescript SDK for easy integration with any node js application
- Forkable demo application that shows how to anyone can interat with the payments provider in their own application



## Getting Started
### Note
This guide assumes that your users are making payments through a node js compatible website. If you are hoping to implement decentralized payments through any other platform/medium please send an email to solutioapp.xyz@gmail.com with details. I will try to accomodate you as best and as quickly as I can.

### Steps:
1. Visit [this website](https://payments.solutioapp.xyz/generate-key) and follow the steps to generate your API key
2. Create your `.env` file with your generated API key and your wallet address
```
SOLUTIO_API_KEY="..." # API for interacting with payments api
PAYMENT_RECEIPT_WALLET_ADDRESS="..." # Wallet address you want payments deposited to
APP_NAME="Example App" # Name of your application to be displayed to user on payment screen
```
2. Install the Solutio typescript sdk package to interact with the payments provider
```
yarn add @solutio/sdk
```
or
```
npm install @solutio/sdk
```
3. Start generating payment links for your users
```
import { generateNewPaymentLink } from "@solutio/sdk";
let paymentLink: string;
...

const createPayment = async (amount: number) => {
    const data = await generateNewPaymentLink(
        process.env.SOLUTIO_API_KEY,
        process.env.APP_NAME,
        process.env.PAYMENT_RECEIPT_WALLET_ADDRESS,
        amount
    );

    paymentLink = data.url;
}
```
4. Open a window for the user to use to make the payment
```
...
window.open(
    paymentLink,
    "Popup",
    "width=400, height=500"
);
```
5. Query the payments API to check the status of the created payment
```
import { checkPaymentStatus } from "@solutio/sdk";
...

// Function returns the signature of the successful Solana transaction
const paymentTxSig = await checkPaymentStatus(apiKey, paymentId);

if (paymentTxSig) {
    // Handle payment success logic
} else {
    // Means payment failed or is yet to be completed.
    // Handle fail case
}
```

## Support
For help getting set up or any questions about implementing Solutio in your application please contact solutioapp.xyz@gmail.com.
