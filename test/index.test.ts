import { Web3, core } from "web3";
import { IpfsPlugin } from "../src";

describe("IpfsPlugin Tests", () => {
  it("should register IpfsPlugin plugin on Web3Context instance", () => {
    const web3Context = new core.Web3Context("http://127.0.0.1:8545");
    web3Context.registerPlugin(new IpfsPlugin());
    expect(web3Context.ipfs).toBeDefined();
  });

  describe("IpfsPlugin method tests", () => {
    let consoleSpy: jest.SpiedFunction<typeof global.console.log>;

    let web3: Web3;

    beforeAll(() => {
      web3 = new Web3("http://127.0.0.1:8545");
      web3.registerPlugin(new IpfsPlugin());
      consoleSpy = jest.spyOn(global.console, "log").mockImplementation();
    });

    afterAll(() => {
      consoleSpy.mockRestore();
    });

    it("should call IpfsPlugin test method with expected param", () => {
      web3.ipfs.test("test-param");
      expect(consoleSpy).toHaveBeenCalledWith("test-param");
    });
  });
});
