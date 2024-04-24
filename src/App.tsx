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
          const res = await axios({
            method: "POST",
            url: "http://localhost:8081/telegram/connect-wallet",
            data: verifySignatureBody,
            headers: {
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiVVNFUiIsImdyYW50X3R5cGUiOiJ0ZWxlZ3JhbSIsInN1YiI6IjIiLCJpYXQiOjE3MTM5NTQ2MzAsImV4cCI6MTcxNDA0MTAzMH0.WtW-sCflyFeQq246t1NU0NV6YxoDNSuJpH2j9VpcG-M",
            },
          });
          console.log("call verify: ", res);
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
      url: "http://localhost:8081/telegram/connect-connect-payload",
      data: {},
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiVVNFUiIsImdyYW50X3R5cGUiOiJ0ZWxlZ3JhbSIsInN1YiI6IjIiLCJpYXQiOjE3MTM5NTQ2MzAsImV4cCI6MTcxNDA0MTAzMH0.WtW-sCflyFeQq246t1NU0NV6YxoDNSuJpH2j9VpcG-M",
      },
    });
    await signMessage(res.data);
  };

  const buyItem = async (orderId: number) => {
    const res = await axios({
      method: "POST",
      url: "http://localhost:8081/payment/create",
      data: {
        item_id: orderId,
        payment_type: "ON_CHAIN",
      },
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiVVNFUiIsImdyYW50X3R5cGUiOiJ0ZWxlZ3JhbSIsInN1YiI6IjIiLCJpYXQiOjE3MTM5NTQ2MzAsImV4cCI6MTcxNDA0MTAzMH0.WtW-sCflyFeQq246t1NU0NV6YxoDNSuJpH2j9VpcG-M",
      },
    });
    console.log("buyItem: ", res);
    await sendTon(
      res.data.payment_wallet,
      Number(res.data.amount),
      res.data.message
    );
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
            <div>
              <button onClick={() => buyItem(1)}>Buy Item#1</button>
            </div>
            <div>
              <button onClick={() => buyItem(2)}>Buy Item#2</button>
            </div>
            <div>
              <button onClick={() => buyItem(3)}>Buy Item#3</button>
            </div>
            <div>
              <button onClick={() => buyItem(4)}>Buy Item#4</button>
            </div>
            <div>
              <button onClick={() => buyItem(5)}>Buy Item#5</button>
            </div>
            <div>
              <button onClick={() => buyItem(6)}>Buy Item#6</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
