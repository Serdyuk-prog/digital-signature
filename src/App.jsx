import { DataDisplay } from "./components/DataDisplay/DataDisplay";
import { StringInput } from "./components/StringInput/StringInput";
import { useState } from "react";
import forge from "node-forge";
import "./App.css";

function extractKeyString(keyBlock) {
  return (
    keyBlock &&
    keyBlock.replace(
      /-----BEGIN (PUBLIC|RSA PRIVATE) KEY-----|-----END (PUBLIC|RSA PRIVATE) KEY-----|[\r\n]+/g,
      ""
    )
  );
}

const App = () => {
  const [privateKey, setPrivateKey] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [message, setMessage] = useState("Это важное сообщение");
  const [signature, setSignature] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("");

  // Функция для генерации RSA ключей
  const generateKeys = () => {
    const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(1024);
    setPrivateKey(privateKey);
    setPublicKey(publicKey);
  };

  // Функция для создания цифровой подписи
  const createSignature = () => {
    if (!privateKey) {
      alert("Прежде чем создать подпись, нужно сгенерировать ключи");
      return;
    }

    // Создаем подпись с использованием приватного ключа
    const md = forge.md.sha256.create();
    md.update(message, "utf8");

    const sig = privateKey.sign(md);
    setSignature(forge.util.encode64(sig));
  };

  // Функция для верификации цифровой подписи
  const verifySignature = () => {
    if (!publicKey || !signature) {
      alert("Публичный ключ или подпись отсутствуют");
      return;
    }

    const md = forge.md.sha256.create();
    md.update(message, "utf8");

    const isVerified = publicKey.verify(
      md.digest().bytes(),
      forge.util.decode64(signature)
    );
    if (isVerified) {
      setVerificationStatus("Подпись проверена успешно");
    } else {
      setVerificationStatus("Подпись не соответствует");
    }
  };

  return (
    <>
      <div className="vertical-container" style={{ width: "800px" }}>
        <div className="button-box">
          <button onClick={generateKeys}>Generate Keys</button>
        </div>

        <fieldset>
          <legend>RSA Parameters</legend>
          <DataDisplay
            data={extractKeyString(
              publicKey ? forge.pki.publicKeyToPem(publicKey) : ""
            )}
            legend="Public Key"
          />
          <DataDisplay
            data={extractKeyString(
              privateKey ? forge.pki.privateKeyToPem(privateKey) : ""
            )}
            legend="Private Key"
          />
        </fieldset>

        <div>
          <button onClick={createSignature}>Create Signature</button>
          <br />
          {signature && <DataDisplay data={signature} legend="Signature" />}
        </div>

        <div>
          <button onClick={verifySignature}>Verify Signature</button>
          <p>{verificationStatus}</p>
        </div>

        <div>
          <StringInput
            legend="Message"
            data={message}
            onChange={setMessage}
          />
        </div>
      </div>
    </>
  );
};

export default App;
