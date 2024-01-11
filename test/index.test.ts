import { Web3, core } from "web3";
import { IpfsPlugin } from "../src";
import * as dotenv from 'dotenv';

describe("IpfsPlugin Tests", () => {
  it("should register IpfsPlugin plugin on Web3Context instance", () => {
    const web3Context = new core.Web3Context("http://127.0.0.1:8545");
    web3Context.registerPlugin(new IpfsPlugin());
    expect(web3Context.ipfs).toBeDefined();
  });

  describe("IpfsPlugin method tests", () => {
    let consoleSpy: jest.SpiedFunction<typeof global.console.log>;

    let web3: Web3;
    dotenv.config();

    beforeAll(() => {
      const PRIVATE_KEY = process.env.ETH_PRIVATE_KEY;
      const PROVIDER_URL = process.env.ETH_PROVIDER_URL;
      web3 = new Web3(PROVIDER_URL);
      web3.registerPlugin(new IpfsPlugin({
        signerPrivateKey: PRIVATE_KEY,
        providerUrl: PROVIDER_URL,
      }));
      consoleSpy = jest.spyOn(global.console, "log").mockImplementation();

      const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY as any);
      web3.eth.accounts.wallet.add(account);
      web3.eth.defaultAccount = account.address;
    });

    afterAll(() => {
      consoleSpy.mockRestore();
    });

    it("should call IpfsPlugin test method with expected param", () => {
      web3.ipfs.test("test-param");
      expect(consoleSpy).toHaveBeenCalledWith("test-param");
    });

    it("should upload file to IPFS", async () => {
      const cid = await web3.ipfs.uploadFile("./test/mock/test.txt");
      expect(cid).toBeDefined();
      expect(cid.toString()).toMatch(/Qm[a-zA-Z0-9]{44}/);
    });

    it("should store CID on Ethereum blockchain", async () => {
      const cid = "QmQWkR3L1r7J9a1r9c9b4k3w2p8o5Vx3d1Xn1zQy1Q7wKX";
      const tx = await web3.ipfs.storeCID(cid);
      expect(tx).toBeDefined();
    }, 50000);

    it("should get CID from Ethereum blockchain", async () => {
      const accountAddress = "0xB0094a90fd007a94c40f8c53CB9E2AD343768E7f";
      const result = await web3.ipfs.listCIDs(accountAddress);
      expect(result).toBeDefined();
    });
  });
});
