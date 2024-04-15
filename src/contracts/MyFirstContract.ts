import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode,
  toNano,
} from "@ton/core";

export type MyFirstContractConfig = {
  counter: number;
  latest_sender: Address | undefined;
  owner: Address | undefined;
};

export function myFirstContractConfigToCell(
  config: MyFirstContractConfig
): Cell {
  return beginCell()
    .storeInt(config.counter, 32)
    .storeAddress(config.latest_sender)
    .storeAddress(config.owner)
    .endCell();
}

export class MyFirstContract implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new MyFirstContract(address);
  }

  static createFromConfig(
    config: MyFirstContractConfig,
    code: Cell,
    workchain = 0
  ) {
    const data = myFirstContractConfigToCell(config);
    const init = { code, data };
    return new MyFirstContract(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async sendIncreaseMessage(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    increaseAmount: number
  ) {
    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeInt(1, 32).storeInt(increaseAmount, 32).endCell(),
    });
  }

  async sendDeposit(provider: ContractProvider, sender: Sender, value: bigint) {
    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeInt(2, 32).endCell(),
    });
  }

  async sendWithdraw(
    provider: ContractProvider,
    sender: Sender,
    value: bigint
  ) {
    await provider.internal(sender, {
      value: toNano("0.02"),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeInt(3, 32).storeCoins(value).endCell(),
    });
  }

  async getCounterStorage(provider: ContractProvider) {
    const { stack } = await provider.get("get_contract_storage", []);
    return {
      counter: stack.readNumber(),
      sender: stack.readAddress(),
      owner: stack.readAddress(),
    };
  }

  async getBalance(provider: ContractProvider) {
    const { stack } = await provider.get("balance", []);
    return {
      balance: stack.readBigNumber(),
    };
  }
}
