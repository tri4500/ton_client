import "./App.css";
import { userMainContract } from "./hooks/useMainContract";
import { VerifyTonProofRequest, useTonConnect } from "./hooks/useTonConnect";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

function Payment() {
  const { sendTon } = userMainContract();

  const { signMessage, connected, disconnect, setOnStatusChange } =
    useTonConnect();

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
            url: "http://localhost:8081/payment/create",
            data: {
              ton_proof: verifySignatureBody.ton_proof,
              address: verifySignatureBody.address,
              state_init: verifySignatureBody.state_init,
              payment_order_id:
                verifySignatureBody.ton_proof?.proof.payload.replace(
                  "Payment: ",
                  ""
                ),
            },
            headers: {
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiVVNFUiIsImdyYW50X3R5cGUiOiJ0ZWxlZ3JhbSIsInN1YiI6IjIiLCJpYXQiOjE3MTQzODE3MDgsImV4cCI6MTcxNDQ2ODEwOH0.PRS2qqiYkBgSTqPtNuPiMnTBGhUrTMz_xq248aFH-tM",
            },
          });
          console.log("call create order: ", res);
          await sendTon(
            res.data.payment_wallet,
            Number(res.data.amount),
            res.data.message
          );
        } catch (e) {
          console.log("error create order: ", e);
        }
        // reset verify signature body
        setVerifySignatureBody(null);
      }
    };
    handleFunc();
  }, [verifySignatureBody]);

  const buyItem = async (orderId: number) => {
    if (connected) {
      await disconnect();
    }
    // preCreateOrder
    const { data: preCreateRes } = await axios({
      method: "POST",
      url: "http://localhost:8081/payment/pre-create",
      data: {
        item_id: orderId,
      },
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
    await signMessage(preCreateRes.message);
  };

  return (
    <div>
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
  );
}

export default Payment;
