[en](https://github.com/wavesplatform/waves-keeper/blob/master/README.md) | ru

# Signer

- [Общие сведения](#общие-сведения)
  - [Провайдер](#провайдер)
  - [Signer + ProviderWeb: как это работает](#signer--providerweb-как-это-работает)
  - [Ограничения](#ограничения)
- [Начало работы](#начало-работы)
  - [1. Установка библиотек Signer и Провайдера](#1-установка-библиотек-signer-и-провайдера)
  - [2. Подключение библиотек](#2-подключение-библиотек)
  - [3. Базовый пример](#3-базовый-пример)
  - [Другие примеры](#другие-примеры)
- [Конструктор](#конструктор)
- [Методы](#методы)
  - [Данные пользователя](#данные-пользователя)
    - [login](#login)
    - [logout](#logout)
    - [getBalance](#getbalance)
    - [getSponsoredBalances](#getsponsoredbalances)
  - [Создание транзакций](#создание-транзакций)
    - [Общие параметры](#общие-параметры)
    - [Как подписать и отправить транзакцию](#как-подписать-и-отправить-транзакцию)
    - [alias](#alias)
    - [burn](#burn)
    - [cancelLease](#cancellease)
    - [data](#data)
    - [exchange](#exchange)
    - [issue](#issue)
    - [lease](#lease)
    - [massTransfer](#masstransfer)
    - [reissue](#reissue)
    - [setAssetScript](#setassetscript)
    - [setScript](#setscript)
    - [sponsorship](#sponsorship)
    - [transfer](#transfer)
    - [batch](#batch)
  - [Прочие методы](#прочие-методы)
    - [broadcast](#broadcast)
    - [getNetworkByte](#getnetworkbyte)
    - [setProvider](#setprovider)
    - [signMessage](#signmessage)
    - [waitTxConfirm](#waittxconfirm)
- [Интерфейс Провайдера](#интерфейс-провайдера)
- [Коды ошибок](#коды-ошибок)

## Общие сведения

Signer — TypeScript/JavaScript-библиотека, которая позволяет вашему веб-приложению подписывать и отправлять транзакции от имени пользователей, не запрашивая у них секретную фразу (seed) или закрытый ключ.

### Провайдер

Для работы Signer необходимо подключить внешнюю библиотеку — Провайдер. Провайдер обеспечивает безопасное хранение приватных данных пользователя. Ни ваше приложение, ни Signer не имеют доступа к закрытому ключу и секретной фразе (seed) пользователя.

Провайдер выполняет аутентификацию пользователя и генерацию цифровой подписи.

Signer предоставляет приложению удобный протокол взаимодействия с Провайдером, а также отправляет транзакции в блокчейн.

![](./_assets/signer.png)

В данный момент вы можете подключить один из следующих Провайдеров:

* [ProviderKeeper](https://github.com/wavesplatform/provider-keeper) использует браузерное расширение [Keeper Wallet](https://keeper-wallet.app).
* [ProviderCloud](https://github.com/waves-exchange/provider-cloud), разработанный командой Waves.Exchange, использует аккаунт Waves.Exchange на основе Email.
* [ProviderWeb](https://github.com/waves-exchange/provider-web), разработанный командой Waves.Exchange, использует аккаунт, созданный или импортированный в веб-приложение Waves.Exchange через секретную фразу или приватный ключ.
* [ProviderLedger](https://www.npmjs.com/package/@waves/provider-ledger) использует устройство Ledger Nano X или Ledger Nano S.
* [ProviderMetaMask](https://github.com/wavesplatform/provider-metamask) использует браузерное расширение [MetaMask](https://metamask.io/).
   
   Пользователям MetaMask в сети Waves доступны только перевод токена и вызов скрипта. Подробнее см. в разделе [Подписание транзакций и ордеров в MetaMask](https://docs.waves.tech/ru/keep-in-touch/metamask).

* [ProviderSeed](https://github.com/wavesplatform/provider-seed) создает аккаунт пользователя из секретной фразы. ProviderSeed можно использовать на этапе разработки и отладки приложения.

Вы также можете разработать собственный Провайдер, см. подраздел [Интерфейс Провайдера](#интерфеис-проваидера).

### Signer + ProviderWeb: как это работает

Получив от Signer запрос на подписание транзакции, ProviderWeb открывает iframe, в котором пользователь может посмотреть детали транзакции, подтвердить или отклонить ее. Получив подтверждение от пользователя, ProviderWeb генерирует цифровую подпись. Процесс подписания транзакции продемонстрирован в следующем видео.

<iframe width="560" height="315" src="https://www.youtube.com/embed/OrcNtEP8XpU?rel=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

### Ограничения

Signer поддерживает все типы транзакций, кроме транзакций обмена и транзакций обновления информации ассета.

Signer поддерживает все браузеры, кроме Brave.

## Начало работы

### 1. Установка библиотек Signer и Провайдера

* Чтобы установить Signer, используйте команду

   ```bash
   npm i @waves/signer
   ```

* Чтобы установить ProviderKeeper, используйте команду

   ```bash
   npm i @waves/provider-keeper
   ```

* Чтобы установить ProviderCloud от Waves.Exchange, используйте команду

   ```bash
   npm i @waves.exchange/provider-cloud
   ```

   Для Windows используйте следующий формат:

   ```bash
   npm i '@waves.exchange/provider-cloud'
   ```

* Чтобы установить ProviderWeb от Waves.Exchange, используйте команду

   ```bash
   npm i @waves.exchange/provider-web
   ```
  
   Для Windows используйте следующий формат:

   ```bash
   npm i '@waves.exchange/provider-web'
   ```

* Чтобы установить ProviderLedger, используйте команду

   ```bash
   npm i @waves/provider-ledger
   ```

* Чтобы установить ProviderMetamask, используйте команду

   ```bash
   npm i @waves/provider-metamask
   ```

* Чтобы установить ProviderSeed, используйте команду

   ```bash
   npm i @waves/provider-seed @waves/waves-transactions
   ```

### 2. Подключение библиотек

Инициализируйте библиотеки в приложении.

* Для работы с Testnet и ProviderKeeper:

   ```js
   import { Signer } from '@waves/signer';
   import { ProviderKeeper } from '@waves/provider-keeper';

   const signer = new Signer({
     // Укажите адрес ноды, подключенной к Testnet
     NODE_URL: 'https://nodes-testnet.wavesnodes.com',
   });
   const keeper = new ProviderKeeper();
   signer.setProvider(keeper);
   ```

* Для работы с Testnet и Waves.Exchange ProviderCloud:

   ```js
   import { Signer } from '@waves/signer';
   import { ProviderCloud } from '@waves.exchange/provider-cloud';
   
   const signer = new Signer({
     // Укажите адрес ноды, подключенной к Testnet
     NODE_URL: 'https://nodes-testnet.wavesnodes.com'
   });
   signer.setProvider(new ProviderCloud())
   ```

* Для работы с Testnet и Waves.Exchange ProviderWeb:

   ```js
   import { Signer } from '@waves/signer';
   import { ProviderWeb } from '@waves.exchange/provider-web';
   
   const signer = new Signer({
     // Укажите адрес ноды, подключенной к Testnet
     NODE_URL: 'https://nodes-testnet.wavesnodes.com'
   });
   signer.setProvider(new ProviderWeb('https://testnet.waves.exchange/signer/'))
   ```

* Для работы с Testnet и ProviderLedger:

   ```js
   import { Signer } from '@waves/signer';
   import { ProviderLedger } from '@waves/provider-ledger';
   
   const signer = new Signer({
     // Specify URL of the node on Testnet
     NODE_URL: 'https://nodes-testnet.wavesnodes.com'
   });
   signer.setProvider(new ProviderLedger({
     // Specify chain ID of Testnet
     wavesLedgerConfig: { networkCode: 84, },
   }));
   ```

* Для работы с Testnet и ProviderMetamask:

   ```js
   import { Signer } from '@waves/signer';
   import { ProviderMetamask } from '@waves/provider-metamask';

   const signer = new Signer({
     // Specify URL of the node on Testnet
     NODE_URL: 'https://nodes-testnet.wavesnodes.com'
   });
   signer.setProvider(new ProviderMetamask());
   ```

* Для работы с Testnet и ProviderSeed:

   ```js
   import { Signer } from '@waves/signer';
   import { ProviderSeed } from '@waves/provider-seed';
   import { libs } from '@waves/waves-transactions';

   const seed = libs.crypto.randomSeed(15);
   const signer = new Signer({
     // Укажите адрес ноды, подключенной к Testnet
     NODE_URL: 'https://nodes-testnet.wavesnodes.com'
   });
   signer.setProvider(new ProviderSeed(seed));
   ```

* Для работы с Mainnet и ProviderKeeper:

   ```js
   import { Signer } from '@waves/signer';
   import { ProviderKeeper } from '@waves/provider-keeper';

   const signer = new Signer();
   const keeper = new ProviderKeeper();
   signer.setProvider(keeper);
   ```

* Для работы с Mainnet и Waves.Exchange ProviderCloud:

   ```js
   import { Signer } from '@waves/signer';
   import { ProviderCloud } from '@waves.exchange/provider-cloud';
   
   const signer = new Signer();
   signer.setProvider(new ProviderCloud());
   ```

* Для работы с Mainnet и Waves.Exchange ProviderWeb:

   ```js
   import { Signer } from '@waves/signer';
   import { ProviderWeb } from '@waves.exchange/provider-web';
   
   const signer = new Signer();
   signer.setProvider(new ProviderWeb());
   ```

* Для работы с Mainnet и ProviderLedger:

   ```js
   import { Signer } from '@waves/signer';
   import { ProviderLedger } from '@waves/provider-ledger';

   const signer = new Signer();
   const provider = new ProviderLedger();
   signer.setProvider(provider);
   ```

* Для работы с Mainnet и ProviderMetamask:

   ```js
   import { Signer } from '@waves/signer';
   import { ProviderMetamask } from '@waves/provider-metamask';

   const signer = new Signer();
   const provider = new ProviderMetamask();
   signer.setProvider(provider);
   ```

Теперь ваше приложение может использовать функции Signer.

### 3. Базовый пример

Ваше приложение готово к работе с блокчейном Waves. Попробуем использовать базовые функции: аутентифицировать пользователя, получить его баланс, перевести токены.

```js
const user = await signer.login();
const balances = await signer.getBalance();
const [broadcastedTransfer] = await signer
  .transfer({amount: 100000000, recipient: 'alias:T:merry'}) // Перевод 1 WAVES алиасу merry
  .broadcast(); // Promise будет разрешен после подписания транзакции пользователем и получения ответа ноды

const [signedTransfer] = await signer
  .transfer({amount: 100000000, recipient: 'alias:T:merry'}) // Перевод 1 WAVES алиасу merry
  .sign(); // Promise будет разрешен после подписания транзакции пользователем
```

### Другие примеры

* Приложение, реализующее кнопку сбора пожертвований: <https://github.com/vlzhr/crypto-donate>.
* Приложение, реализующее отправку транзакций трех типов: <https://github.com/vlzhr/waves-signer-example>.

## Конструктор

```js
new Signer({
  NODE_URL: 'string',
})
```

Создает объект с перечисленными ниже [методами](#методы).

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| NODE_URL | https://nodes.wavesnodes.com | Нода, используемая для доступа к блокчейну |

<!-- | MATCHER_URL | https://matcher.waves.exchange/ | Матчер, используемый для исполнения ордеров | -->

## Методы

* [Данные пользователя](#данные-пользователя)

   * [login](#login)
   * [logout](#logout)
   * [getBalance](#getbalance)
   * [getSponsoredBalances](#getsponsoredbalances)

* [Создание транзакций](#создание-транзакций)

   * [Общие параметры](#общие-параметры)
   * [Как подписать и отправить транзакцию](#как-подписать-и-отправить-транзакцию)
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

* [Прочие](#методы)

   * [broadcast](#broadcast)
   * [getNetworkByte](#getnetworkbyte)
   * [setProvider](#setprovider)
   * [signMessage](#signmessage)
   * [waitTxConfirm](#waittxconfirm)

В коде можно использовать [типы TypeScript](https://github.com/wavesplatform/ts-types/blob/master/transactions/index.ts).

### Данные пользователя

#### login

Выполняет вход в аккаунт пользователя; если у пользователя еще нет аккаунта — создает его.

```js
login();
```

**Возвращает:**
Promise пользовательских данных: адреса и открытого ключа.

> При использовании ProviderMetamask возвращается пустой открытый ключ.

**Пример вызова:**

```ts
const {address, publicKey} = await signer.login();
```

**Пример результата:**

```js
{
  address: '3P8pGyzZL9AUuFs9YRYPDV3vm73T48ptZxs',
  publicKey: 'FuChbN7t3gvW5esgARFytKNVuHSCZpXSYf1y3eDSruEN',
}
```

#### logout

Выполняет выход из аккаунта.

```js
logout();
```

**Возвращает:** Promise\<void\>.

**Пример вызова:**
```ts
await signer.logout();
```

#### getBalance

Если пользователь вошел в аккаунт, функция получает текущий баланс всех ассетов в портфеле пользователя.

```js
getBalance();
```

**Возвращает:** Promise списка ассетов и их балансов.

**Пример вызова:**

```ts
const balances = await signer.getBalance();
```

**Пример результата:**

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

**Поля результата:**

| Имя поля | Описание |
| :--- | :--- |
| assetId | Идентификатор ассета в кодировке Base58 |
| assetName | Название ассета |
| decimals | Количество знаков после запятой в балансе ассета |
| amount | Баланс ассета, умноженный на 10<sup>`decimals`<sup>. Например, для WAVES `decimals` равно 8, поэтому фактическое количество WAVES умножается на 10<sup>8</sup>. `{ "WAVES": 677728840 }` означает 6,77728840 WAVES |
| isMyAsset | `true`, если ассет выпущен текущим пользователем |
| tokens | Баланс ассета для отображения в приложении |
| sponsorship | Количество спонсорского ассета, взимаемое с пользователей (эквивалент 0,001 WAVES), умноженное на  10<sup>`decimals`<sup><br>`null` — если токен не является спосорским |
| isSmart | `true` для [смарт-ассетов](https://docs.waves.tech/ru/building-apps/smart-contracts/what-is-smart-asset) |

#### getSponsoredBalances

Если пользователь вошел в аккаунт, функция получает текущий баланс спонсорских ассетов в портфеле пользователя. См. раздел [Спонсирование](https://docs.waves.tech/ru/blockchain/waves-protocol/sponsored-fee).

```js
getSponsoredBalances();
```

**Возвращает:** Promise списка ассетов и их балансов.

**Пример вызова:**

```ts
const sponsoredBalances = await signer.getSponsoredBalances();
```

**Пример результата:**

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

**Поля результата** такие же, как у метода [getBalance](#getbalance).

### Создание транзакций

Следующие методы создают транзакции (но не подписывают их и не отправляют в блокчейн):

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

> Проверьте, какие типы транзакций поддерживает используемый вами Провайдер.

#### Общие параметры

Каждый из методов создания транзакции имеет необязательные параметры, которые в большинстве случаев не требуется указывать в явном виде:

| Имя поля | Описание | Значение по умолчанию |
| :--- | :--- | :--- |
| chainId | 'W'.charCodeAt(0) или 87 — Mainnet<br/>'T'.charCodeAt(0) или 84 — Testnet<br/>'S'.charCodeAt(0) или 83 — Stagenet | Определяется конфигурацией ноды Waves, указанной в [Конструкторе](#конструктор) |
| fee | Комиссия за транзакцию | Минимальная комиссия за транзакцию, см. раздел [Комиссия за транзакцию](https://docs.waves.tech/ru/blockchain/transaction/transaction-fee).<br>:warning: **Внимание!** При расчете значения по умолчанию для [транзакции вызова скрипта](https://docs.waves.tech/ru/blockchain/transaction-type/invoke-script-transaction) не учитываются [действия скрипта](https://docs.waves.tech/ru/ride/structures/script-actions/). Подробнее в разделе [invoke](#invoke) ниже |
| proofs | Массив подтверждений транзакции | Добавляется методом `sign` или `broadcast` (см. подраздел [Как подписать и отправить транзакцию](#как-подписать-и-отправить-транзакцию)). Если вы указываете подтверждение вручную, оно также добваляется в массив |
| senderPublicKey | Открытый ключ отправителя транзакции в кодировке Base58 | Возвращается методом [login](#login) |

#### Как подписать и отправить транзакцию

Каждый из методов создания транзакции возвращает объект, у которого есть методы `sign` и `broadcast`.

Чтобы подписать транзакцию, используйте метод `sign`. Пример:

```js
signer.invoke({
   dApp: address,
   call: { function: name, args: convertedArgs },
}).sign();
```

Чтобы подписать транзакцию и сразу отправить ее в блокчейн, используйте метод `broadcast`. Пример:

```js
signer.invoke({
   dApp: address,
   call: { function: name, args: convertedArgs },
}).broadcast();
```

> В методе `broadcast` можно использовать те же опции, что и в методе [signer.broadcast](#broadcast), описание которого приведено ниже.

Вы можете подписать или отправить сразу несколько транзакций. Пример:

```js
signer.alias({ 'new_alias', })
  .data([{ key: 'value', type: 'integer', value: 1 ])
  .transfer({ recipient: '3P8pGyzZL9AUuFs9YRYPDV3vm73T48ptZxs', amount: 10000 })
}).broadcast();
```

#### alias

Создает [транзакцию создания псевдонима](https://docs.waves.tech/ru/blockchain/transaction-type/create-alias-transaction).

```js
alias(data: {
  alias: 'string'
})
```

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| alias* | | Короткое, удобное для запоминания имя адреса. См. [Псевдоним](https://docs.waves.tech/ru/blockchain/account/alias) |

\* Обязательный параметр.

См. [Общие параметры](#общие-параметры) для описания остальных параметров.

**Пример вызова:**

```js
const data = {
  alias: 'new_alias',
}

const [tx] = await signer
  .alias(data)
  .broadcast();
```

#### burn

Создает [транзакцию сжигания токена](https://docs.waves.tech/ru/blockchain/transaction-type/burn-transaction).

```js
burn(data: {
    assetId*: 'string',
    quantity*: LONG,
})
```

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| assetId* | | Идентификатор сжигаемого ассета в кодировке Base58 |
| quantity* | | Количество сжигаемого ассета, умноженное на 10<sup>decimals</sup>. Например, для WAVES `decimals` равно 8, поэтому фактическое количество WAVES умножается на 10<sup>8</sup>. `{ "WAVES": 677728840 }` означает 6,77728840 WAVES  |

\* Обязательный параметр.

См. [Общие параметры](#общие-параметры) для описания остальных параметров.

**Пример вызова:**

```js
const data = {
  assetId: '4uK8i4ThRGbehENwa6MxyLtxAjAo1Rj9fduborGExarC',
  quantity: 100,
}

const [tx] = await signer
  .burn(data)
  .broadcast();
```

#### cancelLease

Создает [транзакцию закрытия лизинга](https://docs.waves.tech/ru/blockchain/transaction-type/lease-cancel-transaction).

```js
cancelLease(data: {
    leaseId: 'string',
})
```

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| leasetId* | | Идентификатор транзакции лизинга в кодировка Base58 |

\* Обязательный параметр.

См. [Общие параметры](#общие-параметры) для описания остальных параметров.

**Пример вызова:**

```js
const data = {
  leaseId: '69HK14PEHq2UGRfRYghVW8Kc3487uJaoUmk2ntT4kw7X',
}

const [tx] = await signer
  .cancelLease(data)
  .broadcast();
```

#### data

Создает [транзакцию данных](https://docs.waves.tech/ru/blockchain/transaction-type/data-transaction).

```js
data(data: [{
  key: 'string',
  type: 'string' | 'integer' | 'binary' | 'boolean',
  value: 'string' | number | boolean,
])
```

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| key* | | Ключ записи. Не более 100 символов |
| type | | Тип записи |
| value* | | Значение записи. Не более 5 Кбайт |

\* Обязательный параметр.

См. [Общие параметры](#общие-параметры) для описания остальных параметров.

**Пример вызова:**

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

Создает [транзакцию обмена](https://docs.waves.tech/ru/blockchain/transaction-type/data-transaction).

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

**Параметры:**

| Имя поля | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| buyOrder* | | Key of a record. Maximum of 100 characters |
| sellOrder* | | Type of a record |
| price* | | Value of a record. Maximum of 5 Kbytes |
| amount* | | Value of a record. Maximum of 5 Kbytes |
| buyMatcherFee* | | Value of a record. Maximum of 5 Kbytes |
| sellMatcher* | | Value of a record. Maximum of 5 Kbytes |

\* Обязательный параметр.

См. [Общие параметры](#общие-параметры) для описания остальных параметров.

**Возвращает:** Promise of ???

**Пример вызова:**

```js
const data = {}

const [tx] = await signer
  .exchange(data)
  .broadcast();
```-->

#### invoke

Создает [транзакцию вызова скрипта](https://docs.waves.tech/ru/blockchain/transaction-type/invoke-script-transaction).

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

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| dApp* | | Адрес в кодировке Base58 или псевдоним (с префиксом `alias:T:`) dApp-скрипта, который нужно вызвать |
| fee | | :warning: **Внимание!** Значение по умолчанию не учитывает [действия скрипта](https://docs.waves.tech/ru/ride/structures/script-actions/). В случае вызова функции dApp-скрипта, которая выполняет выпуск токенов, не являющихся NFT, рассчитайте комиссию самостоятельно, в соответствии с описанием в разделе [Транзакция вызова скрипта](https://docs.waves.tech/ru/blockchain/transaction-type/invoke-script-transaction) |
| payment | | Платежи, приложенные к вызову. Не более 10 платежей |
| payment.assetId* | | Идентификатор ассета платежа в кодировке Base58. `WAVES` или `null` соответствуют WAVES |
| payment.amount* | | Количество ассета, умноженное на 10<sup>`decimals`<sup>. Например, для WAVES `decimals` равно 8, поэтому фактическое количество WAVES умножается на 10<sup>8</sup>. `{ "WAVES": 677728840 }` означает 6,77728840 WAVES |
| call | Вызывается функция по умолчанию | Параметры вызываемой функции |
| call.function* | | Имя вызываемой функции |
| call.args* | | Аргументы вызываемой функции |
| call.args.type* | | Тип аргумента |
| call.args.value* | | Значение аргумента |
| feeAssetId | WAVES | Идентификатор спонсорского ассета, в котором будет уплачена комиссия за транзакцию, в кодировке Base58. См. раздел [Спонсирование](https://docs.waves.tech/ru/blockchain/waves-protocol/sponsored-fee). `null` или отсутствующий параметр означает WAVES |

\* Обязательный параметр.

См. [Общие параметры](#общие-параметры) для описания остальных параметров.

**Пример вызова:**

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

#### issue

Создает [транзакцию выпуска](https://docs.waves.tech/ru/blockchain/transaction-type/issue-transaction).

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

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| name* | | Название ассета |
| decimals* | | Количество знаков после запятой |
| quantity* | | Количество ассета, умноженное на 10<sup>`decimals`<sup> |
| reissuable* | | `true` – довыпуск возможен;<br>`false` — довыпуск невозможен |
| description* | | Описание ассета |
| script | | Скрипт ассета в кодировке Base64 (с префиксом `base64:`) |

\* Обязательный параметр.

См. [Общие параметры](#общие-параметры) для описания остальных параметров.

**Пример вызова:**

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

#### lease

Создает [транзакцию лизинга](https://docs.waves.tech/ru/blockchain/transaction-type/lease-transaction).

```js
lease(data: {
    amount: LONG,
    recipient: 'string',
})
```

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| amount* | | Количество WAVES, умноженное на 10<sup>`decimals`<sup>. `{ "WAVES": 677728840 }` означает 6,77728840 WAVES |
| recipient* | | [Адрес](https://docs.waves.tech/ru/blockchain/account/address) получателя в кодировке Base58 или алиас получателя (с префиксом `alias:T:`) |

\* Обязательный параметр.

См. [Общие параметры](#общие-параметры) для описания остальных параметров.

**Пример вызова:**

```js
const data = {
    amount: 10000,
    recipient: 'alias:T:merry',
}

const [tx] = await signer
  .lease(data)
  .broadcast();
```

#### massTransfer

Создает [транзакцию массового перевода](https://docs.waves.tech/ru/blockchain/transaction-type/mass-transfer-transaction).

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

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| assetId | WAVES | Идентификатор ассета в кодировке Base58 |
| transfers* | | Список переводов |
| transfers.amount* | | Количество ассета, умноженное на 10<sup>`decimals`<sup>. Например, для WAVES `decimals` равно 8, поэтому фактическое количество WAVES умножается на 10<sup>8</sup>. `{ "WAVES": 677728840 }` означает 6,77728840 WAVES |
| transfers.recipient* | | [Адрес](https://docs.waves.tech/ru/blockchain/account/address) получателя в фодировке Base58 или алиас получателя (с префиксом `alias:T:`) |
| attachment | | Произвольные данные: байты в кодировке Base58. Обычно используются для комментария к переводу. Не более 140 байт |

\* Обязательный параметр.

См. [Общие параметры](#общие-параметры) для описания остальных параметров.

**Пример вызова:**

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

#### reissue

Создает [транзакцию довыпуска](https://docs.waves.tech/ru/blockchain/transaction-type/reissue-transaction).

```js
reissue(data: {
  assetId: 'string',
  quantity: LONG,
  reissuable: boolean,
})
```

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| assetId* | | Идентификатор ассета в кодировке Base58 |
| quantity* | | Количество ассета к довыпуску, умноженное на 10<sup>`decimals`<sup> |
| reissuable* | | `true` – повторный довыпуск возможен.<br>`false` — повторный довыпуск невозможен |

\* Обязательный параметр.

См. [Общие параметры](#общие-параметры) для описания остальных параметров.

**Пример вызова:**

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

#### setAssetScript

Создает [транзакцию установки скрипта ассета](https://docs.waves.tech/ru/blockchain/transaction-type/set-asset-script-transaction).

```js
setAssetScript(data: {
  assetId: 'string',
  script: 'string',
})
```

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| assetId* | | Идентификатор ассета в кодировке Base58 |
| script | | Скрипт ассета в кодировке Base64 (с префиксом `base64:`) |

\* Обязательный параметр.

См. [Общие параметры](#общие-параметры) для описания остальных параметров.

**Пример вызова:**

```js
const data = {
  assetId: 'AcrRM9STdBu5PNiFveTCbRFTS8tADhKcsbC2KBp8A4tx',
  script: 'base64:AwZd0cYf...',
}

const [tx] = await signer
  .setAssetScript(data)
  .broadcast();
```

#### setScript

Создает [транзакцию установки скрипта](https://docs.waves.tech/ru/blockchain/transaction-type/set-script-transaction).

```js
setScript(data: {
  script: 'string',
})
```

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| script | | [Скрипт аккаунта](https://docs.waves.tech/ru/ride/script/script-types/account-script) или [dApp-скрипт](https://docs.waves.tech/ru/ride/script/script-types/dapp-script) в кодировке Base64 (с префиксом `base64:`). `null` — отмена установки скрипта |

См. [Общие параметры](#общие-параметры) для описания остальных параметров.

**Пример вызова:**

```js
const data = {
  script: 'base64:AAIDAAAAAAAAAAQIARIAAAAAAAAAAA...',
}

const [tx] = await signer
  .setScript(data)
  .broadcast();
```

#### sponsorship

Создает [транзакцию спонсирования](https://docs.waves.tech/ru/blockchain/waves-protocol/sponsored-fee).

```js
sponsorship(data: {
    assetId: 'string',
    minSponsoredAssetFee: LONG,
})
```

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| assetId* | | Идентификатор ассета в кодировке Base58 |
| minSponsoredAssetFee | | Количество спонсорского ассета, взимаемое с пользователей (эквивалент 0,001 WAVES), умноженное на  10<sup>`decimals`<sup> |

\* Обязательный параметр.

См. [Общие параметры](#общие-параметры) для описания остальных параметров.

**Пример вызова:**

```js
const data = {
  assetId: 'AcrRM9STdBu5PNiFveTCbRFTS8tADhKcsbC2KBp8A4tx',
  minSponsoredAssetFee: 314,
}

const [tx] = await signer
  .sponsorship(data)
  .broadcast();
```

#### transfer

Создает [транзакцию перевода](https://docs.waves.tech/ru/blockchain/transaction-type/transfer-transaction).

```js
transfer(data: {
  recipient: 'string',
  amount: LONG,
  assetId: 'string',
  attachment: 'string',
  feeAssetId: 'string',
})
```

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| recipient* | | [Адрес](https://docs.waves.tech/ru/blockchain/account/address) получателя в кодировке Base58 или алиас получателя (с префиксом `alias:T:`) |
| amount* | | Количество ассета, умноженное на 10<sup>`decimals`<sup>. Например, для WAVES `decimals` равно 8, поэтому фактическое количество WAVES умножается на 10<sup>8</sup>. `{ "WAVES": 677728840 }` означает 6,77728840 WAVES  |
| assetId | WAVES | Идентификатор ассета в кодировке Base58. `null` или отсутствующий параметр означает WAVES |
| attachment | | Произвольные данные: байты в кодировке Base58. Обычно используются для комментария к переводу. Не более 140 байт |
| feeAssetId | WAVES | Идентификатор спонсорского ассета, в котором будет уплачена комиссия за транзакцию, в кодировке Base58. См. раздел [Спонсирование](https://docs.waves.tech/ru/blockchain/waves-protocol/sponsored-fee). `null` или отсутствующий параметр означает WAVES |

\* Обязательный параметр.

См. [Общие параметры](#общие-параметры) для описания остальных параметров.

**Пример вызова:**

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

#### batch

Создает список транзакций.

```js
batch([{
  type: number,
  ... // поля, зависящие от типа транзакции
}])
```

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| type* | | [Идентификатор типа транзакции](https://docs.waves.tech/ru/blockchain/transaction-type/) |

\* Обязательный параметр.

**Пример вызова:**

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
]).sign(); // Или broadcast
```

В этом примере метод `sign` возвращает массив подписанных транзакций, в том же порядке, в котором они были приведены в `batch`.

### Прочие методы

* [broadcast](#broadcast)
* [getNetworkByte](#getnetworkbyte)
* [setProvider](#setprovider)
* [signMessage](#signmessage)
* [waitTxConfirm](#waittxconfirm)

#### broadcast

Оправляет ранее подписанные транзакции в блокчейн.

```js
broadcast(tx,[options])
```

**Возвращает:** Promise ответа ноды. См. описание метода [POST /transactions/broadcast](https://docs.waves.tech/ru/waves-node/node-api/transactions) Node API.

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| tx* | | Подписанная транзакция или массив подписанных транзакций |
| options.chain | false | [Тип: boolean] Отправлять следующую транзакцию только после того, как в блокчейн добавлен блок с предыдущей транзакцией и затем еще количество блоков, указанное в параметре `options.confirmations` |
| options.confirmations | -1 | Уровень подтверждения, при котором будет разрешен Promise:<br>меньше 0 – Promise разрешается, когда транзакция попадает в UTX pool<br>0 – Promise разрешается, когда блок, содержащий транзакцию, попадает в блокчейн<br>1 – Promise разрешается, когда в блокчейн добавляется еще один блок и т. д. |

\* Обязательный параметр.

**Пример вызова:**

```js
const [transfer1] = await signer.transfer({amount: 1, recipient: 'alias:T:merry'}).sign();
const [transfer2] = await signer.transfer({amount: 1, recipient: 'alias:T:merry'}).sign();

await signer.broadcast([transfer1, transfer2], {chain: true, confirmations: 2});
```

В этом примере последовательность событий следующая:

* Транзакция `transfer1` передается на ноду и помещается в UTX pool.
* Блок с транзакцией `transfer1` и еще два блока добавляются в блокчейн.
* Транзакция `transfer2` передается на ноду и помещается в UTX pool.
* Блок с транзакцией `transfer2` и еще два блока добавляются в блокчейн.
* Происходит разрешение Promise, и вы можете сообщить пользователю, что его транзакции подтверждены.

#### getNetworkByte

Получает [байт сети](https://docs.waves.tech/ru/blockchain/blockchain-network/#байт-сети).

```js
getNetworkByte();
```

**Возвращает:** Promise байта сети.

**Пример вызова:**

```js
const chainId = signer.getNetworkByte();
```

#### setProvider

Устанавливает Провайдера, который используется для подписания транзакций. Требования к Провайдеру приведены в разделе [Интерфейс Провайдера](#интерфейс-провайдера).

```js
setProvider(provider);
```

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| provider* | | Объект, который реализует интерфейс провайдера |

\* Обязательный параметр.

**Пример вызова:**

```js
signer.setProvider(new Provider());
```

#### signMessage

Получает цифровую подпись пользователя для заданного сообщения. Проверка подписи позволяет убедиться, что аккаунт Waves принадлежит именно этому пользователю.

```js
signMessage(data: string | number)
```

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| data* | | Подписываемые данные: строка или число. Если указано число, оно вначале преобразуется в строку |

\* Обязательный параметр.

**Пример вызова:**

```js
const signature = await signer.signMessage('Ride the Waves!')
```

<details><summary><b>Проверка подписи</b></summary>

**Все провайдеры, кроме ProviderMetamask**

Провайдеры добавляют префикс [255, 255, 255, 1] к подписываемым байтам. Это сделано для того, чтобы в этом методе было невозможно подписать данные транзакций, что может привести к фишингу.

Пример проверки подписи:

```js
const crypto = require('@waves/ts-lib-crypto');
const userData = await signer.login();
const signature = await signer.signMessage('Ride the Waves!')
crypto.verifySignature(userData.publicKey, [255, 255, 255, 1, ...crypto.stringToBytes('Ride the Waves!')], signature))
```

**ProviderMetamask**

ProviderMetamask использует спецификацию EIP-712 и версию **4** функции `signTypedData` API MetaMask. На подпись передается следующая структура:

```json
[
   {
      "types": {
         "EIP712Domain": [
            {
               "name": "chainId",
               "type" :"uint256"
            },
         ],
         "Message": [
            {
               "name": "text",
               "type": "string"
            }
         ]
      },
      "domain": {
         "chainId": <87|84|83>
      },
      "primaryType": "Message",
      "message": {
         "text": "<some custom message>"
      }
   }
]
```

Чтобы проверить подпись, нужно восстановить адрес пользователя из подписи и подписанных данных с помощью версии **4** функции `recoverTypedSignature` и сравнить с ожидаемым.

Пример проверки подписи:

```js
const { recoverTypedSignature } = require('@metamask/eth-sig-util');
const { wavesAddress2eth } = require('@waves/node-api-js');

const userData = await signer.login();
const signature = await signer.signMessage('Ride the Waves!')

const msg =  {
   "types": {
      "EIP712Domain": [
         {
            "name": "chainId",
            "type" :"uint256"
         },
      ],
      "Message": [
         {
            "name": "text",
            "type": "string"
         }
      ]
   },
   "domain": {
      "chainId": 'T'.charCodeAt(0) // 'W'.charCodeAt(0) for Mainnet
   },
   "primaryType": "Message",
   "message": {
      "text": "Ride the Waves!"
   }
};

const recovered = recoverTypedSignature({
   data: msg,
   signature: signature,
   version: 'V4'
});

recovered === wavesAddress2eth(userData.address)
```
</details>

#### waitTxConfirm

Ожидает появления транзакции в блокчейне.

```js
waitTxConfirm(tx, confirmations)
```

**Параметры:**

| Имя параметра | Значение по умолчанию | Описание |
| :--- | :--- | :--- |
| tx* | | Транзакция или массив транзакций, отправленных в блокчейн |
| confirmations* | | Количество блоков, добавленных в блокчейн после блока, содержащего транзакцию |

\* Обязательный параметр.

**Пример вызова:**
```ts
const [tx] = await signer
  .transfer({amount: 10000000, recipient: 'alias:T:merry'})
  .broadcast();

signer.waitTxConfirm(tx, 1).then((tx) => {
  // Требуется еще один блок в блокчейне
}});
```

## Интерфейс Провайдера

> :warning: Чтобы обеспечить конфиденциальность данных пользователя, Провайдер следует реализовывать на основе `iframe`.

Провайдер должен предоставлять следующий интерфейс:

```js
interface Provider {

    /**
     * Signer подписывается на события login в Провайдере
     * При срабатывании Провайдер должен передать данные пользователя: адрес и публичный ключ
     * Для последующей отписки Signer вызывает функцию off
     */
    on(
        event: 'login',
        handler:({ address: string; publicKey: string }) => any 
    ) => Provider;

    /**
     * Signer подписывается на события logout в Провайдере
     * Для последующей отписки Signer вызывает функцию off
     */
    on( event: 'logout', handler:() => any) => Provider;

    /**
     * Signer подписывается на первое событие login в Провайдере
     * При срабатывании Провайдер должен передать данные пользователя:
     *   адрес и публичный ключ, а также выполнить отписку
     * Отписка не нужна
     */
    once(
        event: 'login',
        handler:({ address: string; publicKey: string }) => any 
    ) => Provider;

    /**
     * Signer подписывается на первое событие logout в Провайдере
     * При срабатывании Провайдер должен выполнить отписку
     */
    once( event: 'logout', handler:() => any) => Provider;

    /**
     * Signer отписывается от событий в Провайдере, на которые были подписки
     */
    off(
        event: 'login',
        handler:({ address: string; publicKey: string }) => any 
    ) => Provider;
    off( event: 'logout', handler:() => any) => Provider;

    /**
     * Устанавливает соединение с нодой Waves
     * @param options
     */
    connect(options: {NODE_URL: string, NETWORK_BYTE: number}): Promise<void>;

    /**
     * Выполняет вход в аккаунт пользователя
     */
    login(): Promise<{address: string, publicKey: string}>;

    /**
     * Выполняет выход из аккаунта пользователя
     */
    logout(): Promise<void>;

    /**
     * Подписывает произвольную строку
     * @param data
     */
    signMessage(data: string | number): Promise<string>;

    /**
     * Подписывает типизированные данные
     * @param data
     */
    signTypedData(data: Array<TypedData>): Promise<string>;

    /**
     * Подписывает транзакции в массиве
     * Здесь SignedTx<T> — любая транзакция, T[] — массив любых транзакций
     * @param list
     */
    sign<T extends SignerTx>(toSign: T[]): Promise<SignedTx<T>>;
    sign<T extends Array<SignerTx>>(toSign: T): Promise<SignedTx<T>>;
}
```

## Коды ошибок

| Класс ошибки                  | Код | Тип           | Описание |
|:------------------------------|:-----|:---------------|:--------|
| SignerOptionsError            | 1000 | validation     | Invalid signer options: NODE_URL, debug |
| SignerNetworkByteError        | 1001 | network        | Could not fetch network from {NODE_URL}: Failed to fetch |
| SignerAuthError               | 1002 | authorization  | Can't use method: getBalance. User must be logged in |
| SignerProviderConnectError    | 1003 | network        | Could not connect the Provider |
| SignerEnsureProviderError     | 1004 | provider       | Can't use method: login. Provider instance is missing<br/>🛈 Возможные причины: пользователь в режиме Инкогнито или отключил cookie |
| SignerProviderInterfaceError  | 1005 | validation     | Invalid provider properties: connect |
| SignerProviderInternalError   | 1006 | provider       | Provider internal error: {...}. This is not error of signer. |
| SignerApiArgumentsError       | 1007 | validation     | Validation error for invoke transaction: {...}. Invalid arguments: senderPublicKey |
| SignerNetworkError            | 1008 | network        | Network Error |
