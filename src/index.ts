import Web3 from "web3";
import { Contract, Web3PluginBase } from "web3";
import type { ContractAbi } from "web3";
import type { CID } from "ipfs-http-client";
import type { IPFS } from "ipfs-core-types";
import * as fs from "fs";
import { create } from "ipfs-http-client";

import { contractABI } from "./abi";

export class IpfsPlugin extends Web3PluginBase {
  public pluginNamespace: string;
  private ipfsClient: IPFS;
  private web3: any;
  private signerPrivateKey: string;
  private contract: any;

  public constructor(
    options: {
      pluginNamespace?: string;
      contractAbi?: ContractAbi;
      contractAddress?: string;
      ipfsHost?: string;
      signerPrivateKey?: string;
      providerUrl?: string;
    } = {},
  ) {
    super();
    this.pluginNamespace = options.pluginNamespace ?? "ipfs";
    this.ipfsClient = create({
      host: options.ipfsHost || "localhost",
      port: 5001,
      protocol: options.ipfsHost ? "https" : "http",
      url: options.ipfsHost || "http://localhost:5001",
    });
    this.signerPrivateKey = options.signerPrivateKey ?? '';
    this.web3 = new Web3('https://endpoints.omniatech.io/v1/eth/sepolia/public');
    this.contract = new this.web3.eth.Contract(
      contractABI,
      '0xA683BF985BC560c5dc99e8F33f3340d1e53736EB',
    );
  }

  public test(param: string): void {
    console.log(param);
  }

  public async uploadFile(filePath: string): Promise<CID> {
    const file = fs.readFileSync(filePath);
    console.log(file.toString());
    const result = await this.ipfsClient.add(file);
    console.log("Added file CID:", result.cid.toString());
    return result.cid;
  }

  public async storeCID(cid: string) {

    const account = this.web3.eth.accounts.privateKeyToAccount(this.signerPrivateKey as any);
    this.web3.eth.accounts.wallet.add(account);
    const fromAddress = account.address;
    return this.contract.methods.store(cid.toString()).send({ from: fromAddress });
  }

  public async listCIDs(ethereumAddress: string) {
    const events = await this.contract.getPastEvents('ALLEVENTS', {
      filter: { owner: ethereumAddress },
      fromBlock: 5064000,
      toBlock: 'latest'
    });

    for (const event of events) {
      console.debug((event as any));
    }

    return events;
  }
}

// Module Augmentation
declare module "web3" {
  interface Web3Context {
    ipfs: IpfsPlugin;
  }
}
