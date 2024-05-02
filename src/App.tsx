import "./App.css";
import { userMainContract } from "./hooks/useMainContract";
import { fromNano } from "@ton/core";
import { VerifyTonProofRequest, useTonConnect } from "./hooks/useTonConnect";
import WebApp from "@twa-dev/sdk";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

function App() {
  const {
    contract_address,
    counter_value,
    contract_balance,
    sendIncrement,
    sendDeposit,
    sendWithdraw,
    sendTon,
  } = userMainContract();

  const { connected, signMessage, disconnect, setOnStatusChange } =
    useTonConnect();

  const showAlert = () => {
    WebApp.showAlert("Hello from Tris DApp");
  };

  const [verifySignatureBody, setVerifySignatureBody] =
    useState<VerifyTonProofRequest | null>(null);
  const inVerifyStage = useRef(false);

  useEffect(() => {
    if (setOnStatusChange) {
      console.log("setOnStatusChange");
      setOnStatusChange((wallet) => {
        if (!wallet) {
          return;
        } else {
          if (
            wallet.connectItems?.tonProof &&
            !("error" in wallet.connectItems.tonProof)
          ) {
            if (!inVerifyStage.current) {
              // handle verify signature
              inVerifyStage.current = true;
              const _verifySignatureBody: VerifyTonProofRequest = {
                ton_proof: wallet.connectItems.tonProof,
                address: wallet.account.address,
                state_init: wallet.account.walletStateInit,
              };
              console.log("setVerifySignatureBody: ", _verifySignatureBody);
              setVerifySignatureBody(_verifySignatureBody);
            }
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    const handleFunc = async () => {
      if (verifySignatureBody && verifySignatureBody.ton_proof !== null) {
        try {
          console.log("verifySignatureBody: ", verifySignatureBody);
          const res = await axios({
            method: "POST",
            url: "http://localhost:8081/telegram/connect-wallet",
            data: {
              ton_proof: verifySignatureBody.ton_proof,
              address: verifySignatureBody.address,
              state_init: verifySignatureBody.state_init,
            },
            headers: {
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiVVNFUiIsImdyYW50X3R5cGUiOiJ0ZWxlZ3JhbSIsInN1YiI6IjIiLCJpYXQiOjE3MTQzODE3MDgsImV4cCI6MTcxNDQ2ODEwOH0.PRS2qqiYkBgSTqPtNuPiMnTBGhUrTMz_xq248aFH-tM",
            },
          });
          console.log("call verify: ", res);
        } catch (e) {
          console.log("error verify: ", e);
        }
      }
      // reset verify signature body
      setVerifySignatureBody(null);
    };
    handleFunc();
  }, [verifySignatureBody]);

  const handleSignMessage = async () => {
    const res = await axios({
      method: "GET",
      url: "http://localhost:8081/telegram/connect-connect-payload",
      data: {},
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiVVNFUiIsImdyYW50X3R5cGUiOiJ0ZWxlZ3JhbSIsInN1YiI6IjIiLCJpYXQiOjE3MTQzODE3MDgsImV4cCI6MTcxNDQ2ODEwOH0.PRS2qqiYkBgSTqPtNuPiMnTBGhUrTMz_xq248aFH-tM",
      },
    });
    setVerifySignatureBody({
      ton_proof: null,
      address: "",
      state_init: "",
    });
    inVerifyStage.current = false;
    await signMessage(res.data);
  };

  return (
    <div>
      {connected ? (
        <div>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      ) : (
        <div>
          <button onClick={() => handleSignMessage()}>
            Sign In With Message
          </button>
        </div>
      )}
      <div>
        <div className="Card">
          <div>
            <b>{WebApp.platform}</b>
          </div>
          <b>Our contract Address</b>
          <div className="Hint">{contract_address?.slice(0, 30) + "..."}</div>
          <b>Our contract Balance</b>
          <div className="Hint">
            {contract_balance ? fromNano(contract_balance) : "NaN"}
          </div>
        </div>

        <div className="Card">
          <b>Counter Value</b>
          <div>{counter_value ?? "Loading..."}</div>
        </div>
        {connected && (
          <div>
            <div>
              <button onClick={() => sendIncrement(1)}>Increment by 1</button>
            </div>
            <div>
              <button onClick={() => sendDeposit(0.05)}>Deposit</button>
            </div>
            <div>
              <button onClick={() => sendWithdraw(0.05)}>Withdraw</button>
            </div>
            <div>
              <button onClick={() => showAlert()}>Test WebApp Alert</button>
            </div>
            <div>
              <button
                onClick={() =>
                  sendTon(
                    "0:7038d1b9aef88efeba69cade802737e902a0748a3f20633df872c38cf89c88de",
                    0.1,
                    "Hello From Tris Dapp"
                  )
                }
              >
                Send Ton
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
