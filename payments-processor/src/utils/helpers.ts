
export const parseSecretKey = (key: string) => {
  const arr = key.split(",");

  return Buffer.from(arr.map((str) => Number(str)));
}