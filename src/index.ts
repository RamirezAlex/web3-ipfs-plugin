import { Web3PluginBase } from "web3";
import type { ContractAbi } from "web3";
import type { CID } from "ipfs-http-client";
import { promises as fsPromises } from "fs";
import { create } from "ipfs-http-client";

// import { ABI } from "./abi";

export class IpfsPlugin extends Web3PluginBase {
  public pluginNamespace: string;
  private ipfsClient;

  public constructor(
    options: {
      pluginNamespace?: string;
      contractAbi?: ContractAbi;
      ipfsApiUrl?: string;
    } = {},
  ) {
    super();
    this.pluginNamespace = options.pluginNamespace ?? "ipfs";
    this.ipfsClient = create({
      url: options.ipfsApiUrl || "http://localhost:5001",
    });
  }

  public test(param: string): void {
    console.log(param);
  }

  public async uploadFile(
    path: string,
  ) {
    const buffer = await fsPromises.readFile(path);
    console.log(`Uploading file ${path} to IPFS...`);
    const addedFile = await this.ipfsClient.add(buffer);
    console.log("Added file CID:", addedFile.cid.toString());

    return await this.storeCID(addedFile.cid);
  }

  private async storeCID(cid: CID) {
    console.log(`Storing CID ${cid} on Ethereum...`);
  }

  public async listCIDs(
    ethereumAddress: string,
  ) {
    console.log(`Listing CIDs for address ${ethereumAddress}...`);
  }
}

// Module Augmentation
declare module "web3" {
  interface Web3Context {
    ipfs: IpfsPlugin;
  }
}
