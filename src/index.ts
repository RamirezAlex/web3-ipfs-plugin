import Web3, { Contract } from "web3";
import { Web3PluginBase } from "web3";
import type { ContractAbi } from "web3";
import type { CID } from "ipfs-http-client";
import type { IPFS } from "ipfs-core-types";
import * as fs from "fs";
import { create } from "ipfs-http-client";

import { contractABI } from "./abi";

export class IpfsPlugin extends Web3PluginBase {
  public pluginNamespace: string;
  private ipfsClient: IPFS;
  private web3: Web3;
  private signerPrivateKey: string;
  private contract: Contract<typeof contractABI>;

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
      options.contractAbi || contractABI,
      options.contractAddress || '0xA683BF985BC560c5dc99e8F33f3340d1e53736EB',
    );
  }

  public async uploadFile(filePath: string): Promise<CID> {
    try {
      const file = fs.readFileSync(filePath);
      const result = await this.ipfsClient.add(file);
      console.log("Added file CID:", result.cid.toString());
      return result.cid;
    } catch (error) {
      throw new Error("Error uploading file to IPFS:");
    }
  }

  public async storeCID(cid: string) {
    try {
      const account = this.web3.eth.accounts.privateKeyToAccount(this.signerPrivateKey);
      this.web3.eth.accounts.wallet.add(account);
      const fromAddress = account.address;
      return this.contract.methods.store(cid).send({ from: fromAddress });
    } catch (error) {
      throw new Error("Error storing CID on Ethereum blockchain:");
    }
  }

  public async listCIDs(ethereumAddress: string) {
    try {
      const events = await this.contract.getPastEvents('CIDStored', {
        filter: { owner: ethereumAddress },
        fromBlock: 5064000,
        toBlock: 'latest'
      });

      return events.map(event => (event as any).returnValues);
    } catch (error) {
      throw new Error("Error retrieving CIDs:");
    }
  }
}

// Module Augmentation
declare module "web3" {
  interface Web3Context {
    ipfs: IpfsPlugin;
  }
}

