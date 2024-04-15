/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import { useTonClient } from "./useTonclient";
import { Address, OpenedContract } from "@ton/core";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { MyFirstContract } from "../contracts/MyFirstContract";
import { toNano } from "@ton/core";
import { useTonConnect } from "./useTonConnect";

export function userMainContract() {
  const client = useTonClient();
  const { sender } = useTonConnect();

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const [contractData, setContractData] = useState<null | {
    counter_value: number;
    recent_address: Address;
    owner_address: Address;
  }>(null);
  const [contractBalance, setContractBalance] = useState<null | bigint>(null);

  const mainContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = new MyFirstContract(
      Address.parse("EQCcQnpIRm-VLRL2fYIjHYXw4VPEpmx5xdT6qKZkgLYPnL8O")
    );
    return client.open(contract) as OpenedContract<MyFirstContract>;
  }, [client]);

  useEffect(() => {
    async function getValue() {
      if (!mainContract) return;
      // setContractData(null);
      // setContractBalance(null);
      const val = await mainContract.getCounterStorage();
      setContractData({
        counter_value: val.counter,
        recent_address: val.sender,
        owner_address: val.owner,
      });
      const balance = await mainContract.getBalance();
      setContractBalance(balance.balance);
      await sleep(500);
      getValue();
    }
    getValue();
  }, [mainContract]);

  return {
    contract_address: mainContract?.address.toString(),
    ...contractData,
    contract_balance: contractBalance,
    sendIncrement: async (amount: number) => {
      return mainContract?.sendIncreaseMessage(sender, toNano("0.05"), amount);
    },
    sendDeposit: async (amount: number) => {
      return mainContract?.sendDeposit(sender, toNano(amount));
    },
    sendWithdraw: async (amount: number) => {
      return mainContract?.sendWithdraw(sender, toNano(amount));
    },
  };
}
