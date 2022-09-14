import { runStress } from "./stress";
import { ethers } from "ethers";
import * as consts from "./consts";
import { namedAccount, namedAddress } from "./accounts";
import * as fs from "fs";
const path = require("path");

async function sendTransaction(argv: any, threadId: number) {
  const response = await namedAccount(argv.from, threadId)
    .connect(argv.provider)
    .sendTransaction({
      to: namedAddress(argv.to, threadId),
      value: ethers.utils.parseEther(argv.ethamount),
      data: argv.data,
    });
  console.log(response);
}

export const bridgeFundsCommand = {
  command: "bridge-funds",
  describe: "sends funds from l1 to l2",
  builder: {
    ethamount: {
      string: true,
      describe: "amount to transfer (in eth)",
      default: "10",
    },
    from: {
      string: true,
      describe: "account (see general help)",
      default: "funnel",
    },
  },
  handler: async (argv: any) => {
    argv.provider = new ethers.providers.WebSocketProvider(argv.l1url);

    const deploydata = JSON.parse(
      fs
        .readFileSync(path.join(consts.configpath, "deployment.json"))
        .toString()
    );
    const inboxAddr = ethers.utils.hexlify(deploydata.inbox);
    argv.to = "address_" + inboxAddr;
    argv.data =
      "0x0f4d14e9000000000000000000000000000000000000000000000000000082f79cd90000";

    await runStress(argv, sendTransaction);

    argv.provider.destroy();
  },
};

export const sendL1Command = {
  command: "send-l1",
  describe: "sends funds between l1 accounts",
  builder: {
    ethamount: {
      string: true,
      describe: "amount to transfer (in eth)",
      default: "10",
    },
    from: {
      string: true,
      describe: "account (see general help)",
      default: "funnel",
    },
    to: {
      string: true,
      describe: "address (see general help)",
      default: "funnel",
    },
    data: { string: true, describe: "data" },
  },
  handler: async (argv: any) => {
    argv.provider = new ethers.providers.WebSocketProvider(argv.l1url);

    await runStress(argv, sendTransaction);

    argv.provider.destroy();
  },
};

export const sendL2Command = {
  command: "send-l2",
  describe: "sends funds between l2 accounts",
  builder: {
    ethamount: {
      string: true,
      describe: "amount to transfer (in eth)",
      default: "10",
    },
    from: {
      string: true,
      describe: "account (see general help)",
      default: "funnel",
    },
    to: {
      string: true,
      describe: "address (see general help)",
      default: "funnel",
    },
    data: { string: true, describe: "data" },
  },
  handler: async (argv: any) => {
    argv.provider = new ethers.providers.WebSocketProvider(argv.l2url);

    await runStress(argv, sendTransaction);

    argv.provider.destroy();
  },
};
