# Signer

* [Overview](#overview)
* [Restrictions](#restrictions)
* [Getting Started](#getting-started)
* [Constructor](#constructor)
* [Methods](#methods)
* [Provider Interface](#provider-interface)
* [Error Codes](#error-codes)

<a id="overview"></a>
## Overview

Waves Signer is a TypeScript/JavaScript library that features signing and broadcasting transactions on behalf of users without asking them for their seed phrases or private keys.

### Provider

In order to work with Signer, you need to link an external Provider library. Provider securely stores user's private data. Your web app and Signer itself do not have access to user's private key and seed phrase.

The Provider authenticates user and generates a digital signature.

Signer implements developer-friendly protocol for interacting with Provider as well as broadcasts transactions to the blockchain.
![](./_assets/signer.png)

For now, you can use one of the following Providers:

* [ProviderSeed](https://github.com/wavesplatform/provider-seed) developed by Waves team creates user account from SEED. ProviderSeed can be used at the app debugging stage.
* [ProviderWeb](https://github.com/waves-exchange/provider-web) developed by Waves.Exchange team uses an account created or imported into the Waves.Exchange web app via user's private key or seed phrase.
* [ProviderCloud](https://github.com/waves-exchange/provider-cloud) developed by Waves.Exchange team uses an email-based Waves.Exchange.

You can also develop your own Provider, see the [Provider Interface](#provider-interface) section below.

### Signer + ProviderWeb: How It Works

When Signer requests to sign a transaction, ProviderWeb opens an [iframe](https://html.spec.whatwg.org/multipage/iframe-embed-object.html), where the user can review transaction details and confirm or reject it. Upon confirmation, ProviderWeb generates a digital signature.

<a id="restrictions"></a>
## Restrictions

Signer supports all types of transactions except Exchange transaction and Update Asset Info transaction.

Signer supports all browsers except Brave.

<a id="getting-started"></a>
## Getting Started

### 1. Signer and Provider library installation

* To install Signer library use

   ```bash
   npm i @waves/signer
   ```

* To install ProviderSeed developed by Waves team, use

   ```bash
   npm i @waves/provider-seed @waves/waves-transactions
   ```

* To install ProviderWeb developed by Waves.Exchange, use

   ```bash
   npm i @waves.exchange/provider-web
   ```

   For Windows, use the following format:

   ```bash
   npm i '@waves.exchange/provider-web'
   ```

* To install ProviderCloud developed by Waves.Exchange, use

   ```bash
   npm i @waves.exchange/provider-cloud
   ```

   For Windows, use the following format:

   ```bash
   npm i '@waves.exchange/provider-cloud'
   ```

### 2. Library initialization

Add library initialization to your app.

* For Testnet & ProviderSeed:

   ```js
   import { Signer } from '@waves/signer';
   import { ProviderSeed } from '@waves/provider-seed';
   import { libs } from '@waves/waves-transactions';

   const seed = libs.crypto.randomSeed(15);
   const signer = new Signer({
     // Specify URL of the node on Testnet
     NODE_URL: 'https://nodes-testnet.wavesnodes.com'
   });
   signer.setProvider(new ProviderSeed(seed));
   ```

* For Testnet & Waves.Exchange ProviderWeb:

   ```js
   import { Signer } from '@waves/signer';
   import { ProviderWeb } from '@waves.exchange/provider-web';
   
   const signer = new Signer({
     // Specify URL of the node on Testnet
     NODE_URL: 'https://nodes-testnet.wavesnodes.com'
   });
   signer.setProvider(new ProviderWeb('https://testnet.waves.exchange/signer/'))
   ```

* For Testnet & Waves.Exchange ProviderCloud:

   ```js
   import { Signer } from '@waves/signer';
   import { ProviderCloud } from '@waves.exchange/provider-cloud';
   
   const signer = new Signer({
     // Specify URL of the node on Testnet
     NODE_URL: 'https://nodes-testnet.wavesnodes.com'
   });
   signer.setProvider(new ProviderCloud('https://testnet.waves.exchange/signer/'))
   ```

* For Mainnet & Waves.Exchange ProviderWeb:

   ```js
   import { Signer } from '@waves/signer';
   import { ProviderWeb } from '@waves.exchange/provider-web';
   
   const signer = new Signer();
   signer.setProvider(new ProviderWeb());
   ```

* For Mainnet & Waves.Exchange ProviderCloud:

   ```js
   import { Signer } from '@waves/signer';
   import { ProviderCloud } from '@waves.exchange/provider-cloud';
   
   const signer = new Signer();
   signer.setProvider(new ProviderCloud());
   ```

After that you will be able to use Signer features in the app.

### 3. Basic example

Now your application is ready to work with Waves blockchain. Let's test it by implementing basic functionality. For example, we could try to authenticate user, get his/her balances and transfer funds.

```js
const user = await signer.login();
const balances = await signer.getBalance();
const [broadcastedTransfer] = await signer
  .transfer({amount: 100000000, recipient: 'alias:T:merry'}) // Transfer 1 WAVES to alias merry
  .broadcast(); // Promise will resolved after user sign and node response

const [signedTransfer] = await signer
  .transfer({amount: 100000000, recipient: 'alias:T:merry'}) // Transfer 1 WAVES to alias merry
  .sign(); // Promise will resolved after user sign
```

<a id="more-examples"></a>
### More examples

See example of an app that implements the donate button: <https://github.com/vlzhr/crypto-donate>.

<a id="constructor"></a>
## Constructor

```js
new Signer({
  NODE_URL: 'string',
})
```

Creates an object that features the following [methods](#methods).

Parameters:

| Parameter | Default value | Description |
| :--- | :--- | :--- |
| NODE_URL | https://nodes.wavesnodes.com | Node that is used to access a blockchain |

<!-- | MATCHER_URL | https://matcher.waves.exchange/ | Matcher that is used to serve orders | -->

<a id="methods"></a>
## Methods

* [User Info](#user-info)

   * [login](#login)
   * [logout](#logout)
   * [getBalance](#getbalance)
   * [getSponsoredBalances](#getsponsoredbalances)

* [Сreate Transactions](#create-transactions)

   * [Common fields](#common-fields)
   * [How to sign and broadcast transactions](#how-to-sign-and-broadcast-transactions)
   * [alias](#alias)
   * [burn](#burn)
   * [cancelLease](#cancellease)
   * [data](#data)
   * [invoke](#invoke)
   * [issue](#issue)
   * [lease](#lease)
   * [massTransfer](#masstransfer)
   * [reissue](#reissue)
   * [setAssetScript](#setassetscript)
   * [setScript](#setscript)
   * [sponsorship](#sponsorship)
   * [transfer](#transfer)
   * [batch](#batch)

* [Others](#others)

   * [broadcast](#broadcast)
   * [getNetworkByte](#getnetworkbyte)
   * [setProvider](#setprovider)
   * [waitTxConfirm](#waittxconfirm)

In code you can use [TypeScript types](https://github.com/wavesplatform/ts-types/blob/master/transactions/index.ts).

<a id="user-info"></a>
### User Info

<a id="login"></a>
#### login

Authenticates user with his/her account; creates account if it don't exist.

```js
login();
```

**Returns:**
Promise of user data: address and public key.


**Usage:**
```ts
const {address, publicKey} = await signer.login();
```

**Output example:**

```js
{
  address: '3P8pGyzZL9AUuFs9YRYPDV3vm73T48ptZxs',
  publicKey: 'FuChbN7t3gvW5esgARFytKNVuHSCZpXSYf1y3eDSruEN',
}
```

<a id="logout"></a>
#### logout

Logs user out.

```js
logout();
```

**Returns:** Promise\<void\>.

**Usage:**
```ts
await signer.logout();
```

<a id="getbalance"></a>
#### getBalance

If user logged in, provides balances of assets in user's portfolio.

```js
getBalance();
```

**Returns:** Promise of list of balances.

**Usage:**

```ts
const balances = await signer.getBalance();
```

**Output example:**

```js
[{
  assetId: 'WAVES',
  assetName: 'Waves',
  decimals: 8,
  amount: 100000000,
  isMyAsset: false,
  tokens: 1,
  sponsorship: null,
  isSmart: false
},
{
  assetId: 'AcrRM9STdBu5PNiFveTCbRFTS8tADhKcsbC2KBp8A4tx',
  assetName: 'CoffeeCoin',
  decimals: 3,
  amount: 1500,
  isMyAsset: false,
  tokens: 1.5,
  isSmart: false,
  sponsorship: 500
}]
```

**Output fields:**

| Field name | Description |
| :--- | :--- |
| assetId | Base58 encoded ID of the asset |
| assetName | Name of the asset |
| decimals | Number of decimal places in the asset amount |
| amount | Amount of asset multiplied by 10^`decimals`. For example, `decimals` of WAVES is 8, so the real amount is multipied by 10^8. `{ "WAVES": 677728840 }` means 6.77728840 |
| isMyAsset | `true` if current user is an asset issuer |
| tokens | Amount of asset to display in app interface |
| sponsorship | Amount of sponsored asset to be charged to users (per 0.001 WAVES) multiplied by 10^`decimals`<br>`null` if the asset is not sponsored |
| isSmart | `true` for [smart assets](https://docs.waves.tech/en/building-apps/smart-contracts/what-is-smart-asset) |

<a id="getsponsoredbalances"></a>
#### getSponsoredBalances

If user logged in, provides balances of sponsored assets in user's portfolio. See [Sponsored Fee](https://docs.waves.tech/en/blockchain/waves-protocol/sponsored-fee).

```js
getSponsoredBalances();
```

**Returns:** Promise of list of balances.

**Usage:**

```ts
const sponsoredBalances = await signer.getSponsoredBalances();
```

**Output example:**

```js
[{
  assetId: 'AcrRM9STdBu5PNiFveTCbRFTS8tADhKcsbC2KBp8A4tx',
  assetName: 'CoffeeCoin',
  decimals: 3,
  amount: 1500,
  isMyAsset: false,
  tokens: 1.5,
  isSmart: false,
  sponsorship: 500
}]
```

**Output fields** are the same as in [getBalance](#getbalance) method.

<a id="create-transactions"></a>
### Create transactions

The following methods create transactions (but do not sign or broadcast them):

* [alias](#alias)
* [burn](#burn)
* [cancelLease](#cancellease)
* [data](#data)
* [invoke](#invoke)
* [issue](#issue)
* [lease](#lease)
* [massTransfer](#masstransfer)
* [reissue](#reissue)
* [setAssetScript](#setassetscript)
* [setScript](#setscript)
* [sponsorship](#sponsorship)
* [transfer](#transfer)

> Check which of these transactions are supported by your Provider.

<a id="common-fields"></a>
#### Common fields

Each create transaction method has optional fields that you don't specify manually in most cases:

| Field name | Description | Default value |
| :--- | :--- | :--- |
| chainId | 'W'.charCodeAt(0) or 87 means Mainnet<br/>'T'.charCodeAt(0) or 84 means Testnet | Defined by configuration of Waves node that is set in [Constructor](#constructor) |
| fee | Transaction fee | Calculated automatically as described in [Transaction fee](https://docs.waves.tech/en/blockchain/transaction/transaction-fee) section |
| proofs | Array of transaction signatures | Added by `sign` or `broadcast` method (see [How to Sign and Broadcast Transactions](#how-to-sign-and-broadcast-transactions)). If you specify a proof manually, it is also added to the array |
| senderPublicKey | Base58 encoded public key of transaction sender | Returned by [login](#login) method |

<a id="how-to-sign-and-broadcast-transactions"></a>
#### How to Sign and Broadcast Transactions

Each create transaction method returns object that features the `sign` and `broadcast` methods.

To sign transaction use `sign` method. For example:

```js
signer.invoke({
   dApp: address,
   call: { function: name, args: convertedArgs },
}).sign();
```

To sign transaction and immediately send it to blockchain use `broadcast` method. For example:

```js
signer.invoke({
   dApp: address,
   call: { function: name, args: convertedArgs },
}).broadcast();
```

Note: this `broadcast` method has the same options as the [signer.broadcast](#broadcast) method that is described below.

You can sign or broadcast several transactions at once. For example:

```js
signer.alias({ 'new_alias', })
  .data([{ key: 'value', type: 'integer', value: 1 ])
  .transfer({ recipient: '3P8pGyzZL9AUuFs9YRYPDV3vm73T48ptZxs', amount: 10000 })
}).broadcast();
```

<a id="alias"></a>
#### alias

Creates [Create Alias transaction](https://docs.waves.tech/en/blockchain/transaction-type/create-alias-transaction).

```js
alias(data: {
  alias: 'string'
})
```

**Parameters:**

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| alias* | | Short and easy to remember name of address. See [Alias](https://docs.waves.tech/en/blockchain/account/alias) for more information |

\* Required parameter.

See [Common fields](#common-fields) for other fields description.

**Usage:**

```js
const data = {
  alias: 'new_alias',
}

const [tx] = await signer
  .alias(data)
  .broadcast();
```

<a id="burn"></a>
#### burn

Creates [Burn transaction](https://docs.waves.tech/en/blockchain/transaction-type/burn-transaction).

```js
burn(data: {
    assetId*: 'string',
    quantity*: LONG,
})
```

**Parameters:**

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| assetId* | | Base58 encoded ID of the asset to burn |
| quantity* | | Amount of asset multiplied by 10^`decimals`. For example, `decimals` of WAVES is 8, so the real amount is multipied by 10^8. `{ "WAVES": 677728840 }` means 6.77728840 |

\* Required parameter.

See [Common fields](#common-fields) for other fields description.

**Usage:**

```js
const data = {
  assetId: '4uK8i4ThRGbehENwa6MxyLtxAjAo1Rj9fduborGExarC',
  quantity: 100,
}

const [tx] = await signer
  .burn(data)
  .broadcast();
```

<a id="cancellease"></a>
#### cancelLease

Creates [Lease Cancel transaction](https://docs.waves.tech/en/blockchain/transaction-type/lease-cancel-transaction).

```js
cancelLease(data: {
    leaseId: 'string',
})
```

**Parameters:**

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| leasetId* | | Base58 encoded ID of the Lease transaction |

\* Required parameter.

See [Common fields](#common-fields) for other fields description.

**Usage:**

```js
const data = {
  leaseId: '69HK14PEHq2UGRfRYghVW8Kc3487uJaoUmk2ntT4kw7X',
}

const [tx] = await signer
  .cancelLease(data)
  .broadcast();
```

<a id="data"></a>
#### data

Creates [Data transaction](https://docs.waves.tech/en/blockchain/transaction-type/data-transaction).

```js
data(data: [{
  key: 'string',
  type: 'string' | 'integer' | 'binary' | 'boolean',
  value: 'string' | number | boolean,
])
```

**Parameters:**

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| key* | | Key of a record. Maximum of 100 characters |
| type | | Type of a record |
| value* | | Value of a record. Maximum of 5 Kbytes |

\* Required parameter.

See [Common fields](#common-fields) for other fields description.

**Usage:**

```js
const records = [
  { key: 'name', type: 'string', value: 'Lorem ipsum dolor sit amet' },
  { key: 'value', type: 'integer', value: 1234567 },
  { key: 'flag', type: 'boolean', value: true }
]

const [tx] = await signer
  .data({ data: records })
  .broadcast();
```

<!-- <a id="exchange"></a>
#### exchange

Creates [exchange](https://docs.waves.tech/en/blockchain/transaction-type/exchange-transaction) transaction.

```js
exchange(data: {
  buyOrder: IExchangeTransactionOrder<LONG> & IWithProofs (??),
  sellOrder: IExchangeTransactionOrder<LONG> & IWithProofs,
  price: LONG,
  amount: LONG,
  buyMatcherFee: LONG,
  sellMatcherFee: LONG,
})
```

**Parameters:**

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| buyOrder* | | Key of a record. Maximum of 100 characters |
| sellOrder* | | Type of a record |
| price* | | Value of a record. Maximum of 5 Kbytes |
| amount* | | Value of a record. Maximum of 5 Kbytes |
| buyMatcherFee* | | Value of a record. Maximum of 5 Kbytes |
| sellMatcher* | | Value of a record. Maximum of 5 Kbytes |

\* Required parameter.

See [Common fields](#common-fields) for other fields description.

**Returns:** Promise of ???

**Usage:**

```js
const data = {}

const [tx] = await signer
  .exchange(data)
  .broadcast();
```-->

<a id="invoke"></a>
#### invoke

Creates [Invoke Scipt transaction](https://docs.waves.tech/en/blockchain/transaction-type/invoke-script-transaction).

```js
invoke(data: {
  dApp: 'string',
  fee: LONG,
  payment: [{
    assetId: 'string',
    amount: LONG,
  }],
  call: {
    function: 'string',
    args: [{
      type: 'integer' | 'string' | 'binary',
      value: number | 'string',
    }],
  },
  feeAssetId: 'string',
})
```

**Parameters:**

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| dApp* | | Base58 encoded address or alias (with `alias:T:` prefix) of the dApp whose script should be invoked |
| fee | | We recommend to specify fee depending on number of action performed by called function (see [Transaction Fee](https://docs.waves.tech/en/blockchain/transaction/transaction-fee)) |
| payment | | Payments attached to the transaction. Maximum of two payments |
| payment.assetId* | | Base58 encoded ID of the asset to pay. `WAVES` or `null` means WAVES |
| payment.amount* | | Amount of asset multiplied by 10^`decimals`. For example, `decimals` of WAVES is 8, so the real amount is multipied by 10^8. `{ "WAVES": 677728840 }` means 6.77728840 |
| call | Default function should be invoked in the dApp | Parameters for called function |
| call.function* | | Name of the function that is called |
| call.args* | | Arguments for the function  that is called |
| call.args.type* | | Type of argument |
| call.args.value* | | Value of argument |
| feeAssetId | WAVES | Base58 encoded ID of the sponsored asset to pay the fee. See the [Sponsored Fee](https://docs.waves.tech/en/blockchain/waves-protocol/sponsored-fee) article for more information. `null` or omitted field means WAVES |

\* Required parameter.

See [Common fields](#common-fields) for other fields description.

**Usage:**
```ts
const data = {
  dApp: '3Fb641A9hWy63K18KsBJwns64McmdEATgJd',
  fee: 1000000,
  payment: [{
    assetId: '73pu8pHFNpj9tmWuYjqnZ962tXzJvLGX86dxjZxGYhoK',
    amount: 7,
  }],
  call: {
    function: 'foo',
    args: [
      { type: 'integer', value: 1 },
      { type: 'binary', value: 'base64:AAA=' },
      { type: 'string', value: 'foo' }
    ],
  },
}

const [tx] = await signer
  .invoke(data)
  .broadcast();
```

<a id="issue"></a>
#### issue

Creates [Issue transaction](https://docs.waves.tech/en/blockchain/transaction-type/issue-transaction).

```js
issue(data: {
  name: 'string',
  decimals: number,
  quantity: LONG,
  reissuable: boolean,
  description: 'string',
  script: 'string',
})
```

**Parameters:**

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| name* | | Asset name |
| decimals* | | Number of digits in decimal part |
| quantity* | | Amount of asset multiplied by 10^`decimals` |
| reissuable* | | `true` – asset reissue is possible.<br>`false` — asset reissue is not possible |
| description* | | Asset description |
| script | | Base64 encoded script (with `base64:` prefix) to be attached to to asset |

\* Required parameter.

See [Common fields](#common-fields) for other fields description.

**Usage:**

```js
const data = {
  name: 'MyToken',
  decimals: 8,
  quantity: 100000000000,
  reissuable: true,
  description: 'It is a gaming token',
}

const [tx] = await signer
  .issue(data)
  .broadcast();
```

<a id="lease"></a>
#### lease

Creates [Lease transaction](https://docs.waves.tech/en/blockchain/transaction-type/lease-transaction).

```js
lease(data: {
    amount: LONG,
    recipient: 'string',
})
```

**Parameters:**

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| amount* | | Amount of WAVES multiplied by 10^8. For example, `{ "WAVES": 677728840 }` means 6.77728840 |
| recipient* | | Base58 encoded [address](https://docs.waves.tech/en/blockchain/account/address) or alias (with `alias:T:` prefix) of the recipient |

\* Required parameter.

See [Common fields](#common-fields) for other fields description.

**Usage:**

```js
const data = {
    amount: 10000,
    recipient: 'alias:T:merry',
}

const [tx] = await signer
  .lease(data)
  .broadcast();
```

<a id="masstransfer"></a>
#### massTransfer

Creates [Mass Transfer transaction](https://docs.waves.tech/en/blockchain/transaction-type/mass-transfer-transaction).

```js
massTransfer(data: {
  assetId: 'string',
  transfers: [{
    amount: LONG,
    recipient: 'string',
  }],
  attachment: 'string',
})
```

**Parameters:**

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| assetId | WAVES | Base58 encoded ID of the asset to transfer |
| transfers* | | List of transfers |
| transfers.amount* | | Amount of asset multiplied by 10^`decimals`. For example, `decimals` of WAVES is 8, so the real amount is multipied by 10^8. `{ "WAVES": 677728840 }` means 6.77728840 |
| transfers.recipient* | | Base58 encoded [address](https://docs.waves.tech/en/blockchain/account/address) or alias (with `alias:T:` prefix) of the recipient |
| attachment | | Optional binary data base58 encoded. This field is often used to attach a comment to the transaction. The maximum data size is 140 bytes |

\* Required parameter.

See [Common fields](#common-fields) for other fields description.

**Usage:**

```js
const crypto = require('@waves/ts-lib-crypto')

const data = {
    transfers: [
    {
      amount: 100,
      recipient: '3P23fi1qfVw6RVDn4CH2a5nNouEtWNQ4THs',
    },
    {
      amount: 200,
      recipient: 'alias:T:merry',
    }],
    attachment: crypto.base58Encode(crypto.stringToBytes('sample message for recipient'))
]

const [tx] = await signer
  .massTransfer(data)
  .broadcast();
```

<a id="reissue"></a>
#### reissue

Creates [Reissue transaction](https://docs.waves.tech/en/blockchain/transaction-type/reissue-transaction).

```js
reissue(data: {
  assetId: 'string',
  quantity: LONG,
  reissuable: boolean,
})
```

**Parameters:**

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| assetId* | | Base58 encoded ID of the asset to reissue |
| quantity* | | Amount of asset multiplied by 10^`decimals` to reissue |
| reissuable* | | `true` – asset reissue is possible.<br>`false` — asset reissue is not possible |

\* Required parameter.

See [Common fields](#common-fields) for other fields description.

**Usage:**

```js
const data = {
  assetId: 'AcrRM9STdBu5PNiFveTCbRFTS8tADhKcsbC2KBp8A4tx'
  quantity: 100000000000,
  reissuable: true,
}

const [tx] = await signer
  .reissue(data)
  .broadcast();
```

<a id="setassetscript"></a>
#### setAssetScript

Creates [Set Asset Script transaction](https://docs.waves.tech/en/blockchain/transaction-type/set-asset-script-transaction).

```js
setAssetScript(data: {
  assetId: 'string',
  script: 'string',
})
```

**Parameters:**

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| assetId* | | Base58 encoded ID of the asset |
| script | | Base64 encoded script (with `base64:` prefix) to be attached to the asset |

\* Required parameter.

See [Common fields](#common-fields) for other fields description.

**Usage:**

```js
const data = {
  assetId: 'AcrRM9STdBu5PNiFveTCbRFTS8tADhKcsbC2KBp8A4tx',
  script: 'base64:AwZd0cYf',
}

const [tx] = await signer
  .setAssetScript(data)
  .broadcast();
```

<a id="setscript"></a>
#### setScript

Creates [Set Script transaction](https://docs.waves.tech/en/blockchain/transaction-type/set-script-transaction).

```js
setScript(data: {
  script: 'string',
})
```

**Parameters:**

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| script | | Base64 encoded [account script](https:/docs.waves.tech/en/ride/script/script-types/account-script) or [dApp script](https://docs.waves.tech/en/ride/script/script-types/dapp-script) (with `base64:` prefix) to be attached to the user account. `null` means cancelling the script |

See [Common fields](#common-fields) for other fields description.

**Usage:**

```js
const data = {
  script: 'base64:AAIDAAAAAAAAAAQIARIAAAAAAAAAAA...',
}

const [tx] = await signer
  .setScript(data)
  .broadcast();
```

<a id="sponsorship"></a>
#### sponsorship

Creates [Sponsor Fee transaction](https:/docs.waves.tech/en/blockchain/waves-protocol/sponsored-fee).

```js
sponsorship(data: {
    assetId: 'string',
    minSponsoredAssetFee: LONG,
})
```

**Parameters:**

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| assetId* | | Base58 encoded ID of the asset |
| minSponsoredAssetFee | | Required amount of sponsored token to be charged to users (per 0.001 WAVES) multiplied by 10^`decimals` |

\* Required parameter.

See [Common fields](#common-fields) for other fields description.

**Usage:**

```js
const data = {
  assetId: 'AcrRM9STdBu5PNiFveTCbRFTS8tADhKcsbC2KBp8A4tx',
  minSponsoredAssetFee: 314,
}

const [tx] = await signer
  .sponsorship(data)
  .broadcast();
```

<a id="transfer"></a>
#### transfer

Creates [Transfer transaction](https://docs.waves.tech/en/blockchain/transaction-type/transfer-transaction).

```js
transfer(data: {
  recipient: 'string',
  amount: LONG,
  assetId: 'string',
  attachment: 'string',
  feeAssetId: 'string',
})
```

**Parameters:**

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| recipient* | | Base58 encoded [address](https://docs.waves.tech/en/blockchain/account/address) or alias (with `alias:T:` prefix) of the recipient |
| amount* | | Amount of asset multiplied by 10^`decimals`. For example, `decimals` of WAVES is 8, so the real amount is multipied by 10^8. `{ "WAVES": 677728840 }` means 6.77728840 |
| assetId | WAVES | Base58 encoded ID of the asset to transfer. `null` or omitted field means WAVES |
| attachment | | Optional binary data base58 encoded. This field is often used to attach a comment to the transaction. The maximum data size is 140 bytes |
| feeAssetId | WAVES | Base58 encoded ID of the sponsored asset to pay the fee. See the [Sponsored Fee](https://docs.waves.tech/en/blockchain/waves-protocol/sponsored-fee) article for more information. `null` or omitted field means WAVES |

\* Required parameter.

See [Common fields](#common-fields) for other fields description.

**Usage:**

```js
const crypto = require('@waves/ts-lib-crypto')

const data = {
  recipient: '3P8pGyzZL9AUuFs9YRYPDV3vm73T48ptZxs',
  amount: 10000,
  attachment: crypto.base58Encode(crypto.stringToBytes('sample message for recipient'))
}

const [tx] = await signer
  .transfer(data)
  .broadcast();
```

<a id="batch"></a>
#### batch

Creates list of transactions.

```js
batch([{
  type: number,
  ... // fields depending on the transaction type
}])
```

**Parameters:**

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| type* | | [Transaction type ID](https://docs.waves.tech/en/blockchain/transaction-type/) |

\* Required parameter.

**Usage:**

```js
const [transfer, alias, issue] = await signer.batch([
  {
    type: 4,
    recipient: 'alias:T:merry',
    amount: 100000000
  },
  {
    type: 10,
    alias: 'send33'
  },
  {
    type: 3,
    name: 'SomeTokenName',
    description: 'Some Token Description',
    reissuable: false,
    quantity: 100,
    decimals: 1
  }
]).sign(); // Or broadcast
```

In this example, `sign` method returns array of signed transactions in the same order as they are defined in `batch`.

### Others

<a id="broadcast"></a>
#### broadcast

Sends transactions that are already signed to the blockchain.

```js
broadcast(tx,[options])
```

**Returns:** Promise of node response. See the [POST /transactions/broadcast](https://docs.waves.tech/en/waves-node/node-api/transactions) method description of Node API.

**Parameters:**

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| tx* | | Signed transaction or array of signed transactions |
| options.chain | false | [Type: boolean] Send the next transaction only after the previous transaction is put in the blockchain and confirmed |
| options.confirmations | -1 | Number of confirmations after that the Promise is resolved:<br>less than 0 – Promise is resolved when the transaction is put in UTX pool<br>0 – Promise is resolved when the block that contains the transaction is added to the blockchain<br>1 – Promise is resolved when the next block is added to the blockchain and so on |

\* Required parameter.

**Usage:**

```js
const [transfer1] = await signer.transfer({amount: 1, recipient: 'alias:T:merry'}).sign();
const [transfer2] = await signer.transfer({amount: 1, recipient: 'alias:T:merry'}).sign();

await signer.broadcast([transfer1, transfer2], {chain: true, confirmations: 2});
```

In this example:

* `transfer1` transaction is sent to the node and put in UTX pool.
* Block with `transfer1` and two more blocks are added to the blockchain.
* `transfer2` transaction is sent to the node and put in UTX pool.
* Block with `transfer2` and two more blocks are added to the blockchain.
* Promise is resolved and you can notify user that his/her transactions are confirmed.

<a id="getnetworkbyte"></a>
#### getNetworkByte

Obtains [chain ID](https://docs.waves.tech/en/blockchain/blockchain-network/#chain-id).

```js
getNetworkByte();
```

**Returns:** Promise of chain ID.

**Usage:**

```js
const chainId = signer.getNetworkByte();
```

<a id="setprovider"></a>
#### setProvider

Specifies a Provider that is used to sign transactions. See [Provider Interface](#provider-interface) to find out the provider requirements.

```js
setProvider(provider);
```

**Parameters:**

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| provider* | | Object that features Provider interface |

\* Required parameter.

**Usage:**
```js
signer.setProvider(new Provider());
```

<a id="waittxconfirm"></a>
#### waitTxConfirm

Waits for the transaction to appear in the blockchain.

```js
waitTxConfirm(tx, confirmations)
```

**Parameters:**

| Parameter name | Default value | Description |
| :--- | :--- | :--- |
| tx* | | Transaction or array transactions that are sent to the blockchain |
| confirmations* | | Number of blocks added to the blockchain after the block that contains the transaction |

\* Required parameter.

**Usage:**
```ts
const [tx] = await signer
  .transfer({amount: 10000000, recipient: 'alias:T:merry'})
  .broadcast();

signer.waitTxConfirm(tx, 1).then((tx) => {
  // Tx have one confirmation
}});
```

<a id="provider-interface"></a>
## Provider Interface 

> :warning: To ensure the security of user data, Provider should be based on `iframe`.

Provider should feature the following interface:

```js
interface Provider {

    /**
     * Signer subscribes to login events in the Provider
     * When triggered, the Provider passes user data: address and public key 
     * For further unsubscribe Signer calls `off`
     */
    on(
        event: 'login',
        handler:({ address: string; publicKey: string }) => any 
    ) => Provider;

    /**
     * Signer subscribes to logout events in the Provider
     * For further unsubscribe Signer calls `off`
     */
    on( event: 'logout', handler:() => any) => Provider;

    /**
     * Signer subscribes to the first login event in the Provider
     * When triggered, the Provider passes user data: address and public key,
     *   then cancels the subscription
     */
    once(
        event: 'login',
        handler:({ address: string; publicKey: string }) => any 
    ) => Provider;

    /**
     * Signer subscribes to the first logout event in the Provider
     * When triggered, the Provider cancels the subscription
     */
    once( event: 'logout', handler:() => any) => Provider;

    /**
     * Signer unsubscribes from events previously subscribed to
     */
    off(
        event: 'login',
        handler:({ address: string; publicKey: string }) => any 
    ) => Provider;
    off( event: 'logout', handler:() => any) => Provider;

    /**
     * Sets connection to Waves node
     * @param options
     */
    connect(options: {NODE_URL: string, NETWORK_BYTE: number}): Promise<void>;

    /**
     * Authenticates user with their account
     */
    login(): Promise<{address: string, publicKey: string}>;

    /**
     * Logs user out
     */
    logout(): Promise<void>;

    /**
     * Signs custom message
     * @param data
     */
    signMessage(data: string | number): Promise<string>;

    /**
     * Signs typed data
     * @param data
     */
    signTypedData(data: Array<TypedData>): Promise<string>;

    /**
     * Signs transactions in array
     * Here SignedTx<T> is any transaction, T[] is an array of any transactions
     * @param list
     */
    sign<T extends SignerTx>(toSign: T[]): Promise<SignedTx<T>>;
    sign<T extends Array<SignerTx>>(toSign: T): Promise<SignedTx<T>>;
}
```

## Error Codes

| Error's class                  | Code | Type           | Example |
|:------------------------------|:-----|:---------------|:--------|
| SignerOptionsError            | 1000 | validation     | Invalid signer options: NODE_URL, debug |
| SignerNetworkByteError        | 1001 | network        | Could not fetch network from {NODE_URL}: Failed to fetch |
| SignerAuthError               | 1002 | authorization  | Can't use method: getBalance. User must be logged in |
| SignerProviderConnectError    | 1003 | network        | Could not connect the Provider |
| SignerEnsureProviderError     | 1004 | provider       | Can't use method: login. Provider instance is missing<br/>🛈 Possible reasons: the user is in Incognito mode or has disabled cookies |
| SignerProviderInterfaceError  | 1005 | validation     | Invalid provider properties: connect |
| SignerProviderInternalError   | 1006 | provider       | Provider internal error: {...}. This is not error of signer. |
| SignerApiArgumentsError       | 1007 | validation     | Validation error for invoke transaction: {...}. Invalid arguments: senderPublicKey |
| SignerNetworkError            | 1008 | network        | Network Error |
