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
              setVerifySignatureBody(_verifySignatureBody);
            }
          }
        }
      });
    }
  }, [setOnStatusChange]);

  useEffect(() => {
    const handleFunc = async () => {
      if (verifySignatureBody) {
        try {
          console.log("verifySignatureBody: ", verifySignatureBody);
          // console.log("GOOOOOOOOOOO");
          // const res = await axios({
          //   method: "POST",
          //   url: "https://dev-api.memetd.game/v1/telegram/connect-wallet",
          //   data: verifySignatureBody,
          //   headers: {
          //     Authorization:
          //       "Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiVVNFUiIsImdyYW50X3R5cGUiOiJ0ZWxlZ3JhbSIsInN1YiI6IjMiLCJpYXQiOjE3MTMyNTg2NDUsImV4cCI6MTcxMzM0NTA0NX0.rsaAa1FkGIyXKWgWF7SlwXM2d4RtWroe0qmn0mZQIGA",
          //   },
          // });
          // console.log("call verify: ", res);
        } catch (e) {
          console.log("error verify: ", e);
        }
      }
    };
    handleFunc();
  }, [verifySignatureBody]);

  const handleSignMessage = async () => {
    const res = await axios({
      method: "GET",
      url: "https://dev-api.memetd.game/v1/telegram/connect-connect-payload",
      data: {},
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiVVNFUiIsImdyYW50X3R5cGUiOiJ0ZWxlZ3JhbSIsInN1YiI6IjMiLCJpYXQiOjE3MTMyNTg2NDUsImV4cCI6MTcxMzM0NTA0NX0.rsaAa1FkGIyXKWgWF7SlwXM2d4RtWroe0qmn0mZQIGA",
      },
    });
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
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
