# IpfsPlugin for Web3.js 4.x

## Overview

`IpfsPlugin` is a custom [web3.js](https://github.com/web3/web3.js) 4.x plugin designed to upload files to IPFS and store their CID in Ethereum blockchain
## Features

- **File Uploading:** Upload files to an IPFS node and retrieve their CIDs.
- **Store CIDs on Ethereum:** Store the file CIDs on the Ethereum blockchain, allowing for decentralized and verifiable file tracking.
- **Retrieve Event Logs:** Fetch logs from Ethereum to track stored CIDs.
- **Ease of Integration:** Designed to integrate seamlessly with existing Web3.js setups.

## Installation

To install the plugin, use npm or yarn:

```bash
npm install web3-ipfs-plugin
```

## Usage

1. **Initialization:**

Import `IpfsPlugin` and `Web3`:

```javascript
import Web3 from "web3";
import { IpfsPlugin } from "web3-ipfs-plugin";
```

Initialize Web3 and register the IpfsPlugin:

```javascript
const web3 = new Web3('https://<ethereum-node-url>');
web3.registerPlugin(new IpfsPlugin({
  signerPrivateKey: '<Your-Private-Key>',
  providerUrl: 'https://<ethereum-node-url>',
}));
```

2. **Uploading a File to IPFS:**

```javascript
const cid = await web3.ipfs.uploadFile('<path-to-file>');
console.log('File CID:', cid.toString());
```

3. **Storing a CID on Ethereum:**

```javascript
const txReceipt = await web3.ipfs.storeCID(cid.toString());
console.log('Transaction Receipt:', txReceipt);
```

4. **Listing Stored CIDs:**
```javascript
const events = await web3.ipfs.listCIDs('<ethereum-address>');
events.forEach(event => console.log(event));
```
