import {
  ConnectedWallet,
  TonProofItemReplySuccess,
  useTonConnectUI,
} from "@tonconnect/ui-react";
import { Sender, SenderArguments } from "@ton/core";

export interface VerifyTonProofRequest {
  ton_proof: TonProofItemReplySuccess | null;
  address: string;
  state_init: string;
}

export function useTonConnect(): {
  sender: Sender;
  connected: boolean;
  signMessage: (message: string) => Promise<string>;
  disconnect: () => Promise<void>;
  setOnStatusChange: (
    callback: (wallet: ConnectedWallet | null) => void
  ) => void;
} {
  const [tonConnectUI] = useTonConnectUI();

  return {
    sender: {
      send: async (args: SenderArguments) => {
        tonConnectUI.sendTransaction({
          messages: [
            {
              address: args.to.toString(),
              amount: args.value.toString(),
              payload: args.body?.toBoc().toString("base64"),
            },
          ],
          validUntil: Date.now() + 5 * 60 * 1000,
        });
      },
    },
    connected: tonConnectUI.connected,
    signMessage: async (message: string) => {
      if (tonConnectUI.connected) {
        await tonConnectUI.disconnect();
      }
      tonConnectUI.setConnectRequestParameters({ state: "loading" });
      await tonConnectUI.openModal();
      tonConnectUI.setConnectRequestParameters({
        state: "ready",
        value: { tonProof: message },
      });
      return "hello";
    },
    disconnect: async () => {
      await tonConnectUI.disconnect();
    },
    setOnStatusChange: (callback) => {
      tonConnectUI.onStatusChange(callback);
    },
  };
}
