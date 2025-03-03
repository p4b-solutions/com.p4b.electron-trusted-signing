# Electron Azure Trusted Signing

This is a node library for signing windows electron builds on any platform by jsign lib.

## Installation

This module use java runtime for signing. Make sure you have a [JDK](https://www.oracle.com/cis/java/technologies/downloads/) or [JRE](https://www.java.com/en/) installed.

```bash
npm install @pro4biz/electron-trusted-signing
```

## Usage

After installation, at the root of the project will be two new files `sign.env` and `sign.key`.

They both will be added to `.gitignore`

You should set your own env properties to `sign.env`

```env
  AZURE_TENANT_ID=""
  AZURE_CLIENT_ID=""
  AZURE_CLIENT_SECRET=""
  TRUSTEDSIGNING_ACCOUNT_NAME=""
  TRUSTEDSIGNING_PROFILE_NAME=""
```

The `sign.key` file serves to temporarily save the created access token, it is used for signing until it is not expired, then it will be replaced with a new one.

Also you need add `"signtoolOptions"` to your build config to `"win"` section

```json

"win":{
   ...
   "signtoolOptions": {
     "sign": "@pro4biz/electron-trusted-signing"
   }
   ...
}
```

## Donate for coffee

You can say me "thanks" in [this](https://send.monobank.ua/jar/8LKLuanKpb) way

## License

[MIT](https://choosealicense.com/licenses/mit/)
