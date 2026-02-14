import JSEncrypt from "jsencrypt";

export function encryptData(data) {
  const encrypt = new JSEncrypt();

  const publicKey = import.meta.env.VITE_PUBLIC_KEY;
  encrypt.setPublicKey(publicKey);
  const jsonString = JSON.stringify(data);
  const encrypted = encrypt.encrypt(jsonString);
  return encrypted;
}
