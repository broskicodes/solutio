import type { NextPage } from 'next'
import { useEffect, useState } from 'react';
import { IPFSDownload } from '../components/IpfsDownload';
import styles from '../styles/Home.module.css'
import Link from 'next/link';
import { checkPaymentStatus, generateNewPaymentLink } from '@solutio/sdk';
import { config } from 'dotenv';

export const getServerSideProps = async () => {
  config();

  return { props: {
    apiKey: process.env.API_KEY
  }}
}

interface Props {
  apiKey: string,
}

const appName = "Example";
const receiver = "AA8vwdxzGQfpKBfZmE2FmigiFx8qba8Q8fMHuHP2wcqT";

const Home: NextPage<Props> = ({ apiKey }: Props) => {  
  const [canDwldDog, setCanDwldDog] = useState(false);
  const [linkGenerated, setLinkGenerated] = useState(false);
  const [paymentInit, setPaymentInit] = useState(false);
  const [paymentUrl, setPaymnetUrl] = useState('');
  const [paymentId, setPaymnetId] = useState('');

  useEffect(() => {
    if (!paymentId) {
      return;
    }
    console.log("ki");

    if (paymentInit) {
      const intervalId = setInterval(() => {
        checkPaymentStatus(apiKey, paymentId).then((data) => {
            setCanDwldDog(!!data);
          });
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [paymentInit]);

  return (
    <div className={styles.container}>
      <h1>Payments Example</h1>
      <div>
        <h3>Description</h3>
        <p>
          This is an example application designed for you to experience the basic
          flow over creating a simple one time payment transaction.
        </p>
        <p>
          This software is designed to help people and businesses accept USDC 
          payments for their online products and services.
        </p>
        <p>
          As a quick demonstration of the simplicity and flexibility of this system,
          how about you purchase a picture of: 
        </p>
        <div>
          {!canDwldDog 
            ? !linkGenerated
              ? <button onClick={async () => {
                const data = await generateNewPaymentLink(apiKey, appName, receiver, 0.01);

                setPaymnetUrl(data.url);
                setPaymnetId(data.id);
                setLinkGenerated(true);
                // console.log(data);
              }}>Dog</button>
              : <button onClick={({ clientX, clientY }) => {
                window.open(paymentUrl, 'Popup', `width=450, height=500, left=${clientX}, top=${clientY}`);
              }}>Pay</button>
            : <IPFSDownload filename='mega.jpg' hash='QmPdYY4D6XvoKC1uyXUMtyofcqrqxP9rLKty6ZJwzbeyU1' />
          }
        </div>
        <p>
          Click a link and complete the payment process in the new tab to unlock the download link. Once you sign the transaction you will have to manually close the payment window/tab.
        </p>
        <p>
          P.S. I don't store accout information so if you close or reload this page it will prompt u to pay again.
        </p>
      </div>
      <div>
        <h2>Socials</h2>
        <div>
          <p>For any questions, comments or concerns please reach out to me on</p>
          <Link href={"https://twitter.com/_broskitweets"} target="_blank" >twitter</Link>
          <p>Or if you are really keen to start building, have a look at the code on</p>
          <Link href={"https://github.com/nibbus0x/solutio"} target="_blank">github</Link>
        </div>
      </div>
    </div>
  )
}

export default Home
