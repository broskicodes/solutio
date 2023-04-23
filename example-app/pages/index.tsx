import type { NextPage } from 'next'
import { useEffect, useState, useRef } from 'react';
import { IPFSDownload } from '../components/IpfsDownload';
import styles from '../styles/Home.module.css'
import Link from 'next/link';
import { PAYMENTS_SERVER_URL } from '@solutio/sdk';

interface Pic {
  id: number,
  hash: string,
  filename: string,
  price: number
}

const appName = "Example";
const receiver = "AA8vwdxzGQfpKBfZmE2FmigiFx8qba8Q8fMHuHP2wcqT";
const mint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const Home: NextPage = () => {  
  const [canDwldDog, setCanDwldDog] = useState(false);
  const [canDwldCat, setCanDwldCat] = useState(false);
  const [didPurchaseDog, setDidPurchaseDog] = useState(false);
  const [didPurchaseCat, setDidPurchaseCat] = useState(false);
  const [tkn, setTkn] = useState<string>('')

  const handleClick = ({ id }: Pic) => {
    console.log(tkn)
    id === 1 
      ? setDidPurchaseDog(true)
      : setDidPurchaseCat(true);
  }

  useEffect(() => {
    if (didPurchaseDog) {
      const intervalId = setInterval(() => {
        fetch(`api/isPaymentProcessed?id=1&token=${tkn}`)
          .then((res) => res.json())
          .then((data) => {
            setCanDwldDog(data.processed);
          });
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [didPurchaseDog, tkn]);

  useEffect(() => {
    if (didPurchaseCat) {
      const intervalId = setInterval(() => {
        fetch(`api/isPaymentProcessed?id=2&token=${tkn}`)
          .then((res) => res.json())
          .then((data) => {
            setCanDwldCat(data.processed);
          });
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [didPurchaseCat, tkn]);

  useEffect(() => {
    setTkn(Math.random().toString());
  }, []);

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
            ? <Link href={`${PAYMENTS_SERVER_URL}?id=${1}&appName=${appName}&receiver=${receiver}&mint=${mint}&amount=${0.15}&msg=${tkn}`} target="_blank" onClick={() => { handleClick({id: 1, filename: "mega.jpg", hash: "QmPdYY4D6XvoKC1uyXUMtyofcqrqxP9rLKty6ZJwzbeyU1", price: 0.15 }) }}>My brother's dog</Link>
            : <IPFSDownload filename='mega.jpg' hash='QmPdYY4D6XvoKC1uyXUMtyofcqrqxP9rLKty6ZJwzbeyU1' />
          }
          <p>Or</p>
          {!canDwldCat 
            ? <Link href={`${PAYMENTS_SERVER_URL}?id=${2}&appName=${appName}&receiver=${receiver}&mint=${mint}&amount=${0.10}&msg=${tkn}`} target="_blank" onClick={() => { handleClick({id: 2, filename: "heero.jpg", hash: "QmS2PWCxFEjbUnMPCUb6bBHupoYiZQbJNx9SGBhFuhHTZ5", price: 0.10 }) }}>My brother's cat</Link>
            : <IPFSDownload filename='heero.jpg' hash='QmS2PWCxFEjbUnMPCUb6bBHupoYiZQbJNx9SGBhFuhHTZ5' />
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
          <Link href={"https://twitter.com/nibbus0x"} target="_blank" >twitter</Link>
          <p>Or if you are really keen to start building, have a look at the code on</p>
          <Link href={"https://github.com/nibbus0x/solutio"} target="_blank">github</Link>
        </div>
      </div>
    </div>
  )
}

export default Home
