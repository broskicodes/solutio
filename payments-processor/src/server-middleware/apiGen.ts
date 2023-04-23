import { createHash } from 'crypto';

const generateKey = () => {
  return [...Array(41)]
    .map((elem) => (Math.random() * 58).toString(58))
    .join('');
}