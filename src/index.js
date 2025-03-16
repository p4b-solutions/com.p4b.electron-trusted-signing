import { existsSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const project_root = path.join(__dirname, "../../../");
const module_root = path.join(__dirname, "..");
const env = path.join(project_root, "sign.env");
const key = path.join(project_root, "sign.key");
const jar = path.join(module_root, "lib/jsign-7.1.jar");

const algoritm = (name) => {
  switch (name) {
    case "sha1":
      return "SHA-1";
    case "sha256":
      return "SHA-256";
    case "sha384":
      return "SHA-384";
    case "sha512":
      return "SHA-512";
    default:
      throw new Error(`Unsupported algorithm: ${name}`);
  }
};

async function getAccessToken({ AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET }) {
  let access_token = existsSync(key) ? readFileSync(key, "utf8") : "";
  if (access_token) {
    const { exp } = JSON.parse(Buffer.from(access_token.split(".")[1], "base64").toString());
    if (exp > Date.now() / 1000 + 60) return access_token;
  }
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", AZURE_CLIENT_ID);
  params.append("client_secret", AZURE_CLIENT_SECRET);
  params.append("scope", "https://codesigning.azure.net/.default");
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  const response = await fetch(`https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`, {
    method: "POST",
    headers,
    body: params.toString(),
  });
  if (!response.ok) throw new Error(await response.text());
  const result = await response.json();
  writeFileSync(key, result.access_token, "utf8");
  return result.access_token;
}

export default async function sign({ path, hash }) {
  if (!existsSync(jar)) throw new Error(`Not found library: ${jar}`);
  if (!existsSync(env)) throw new Error(`Not found signing config file: sign.env`);
  const { parsed, error } = require("dotenv").config({ path: env });
  if (error) throw error;
  const { AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, TRUSTEDSIGNING_ACCOUNT_NAME, TRUSTEDSIGNING_PROFILE_NAME } = parsed;
  if (!AZURE_TENANT_ID) throw Error('Env variable "AZURE_TENANT_ID" is not set in sign.env file');
  if (!AZURE_CLIENT_ID) throw Error('Env variable "AZURE_CLIENT_ID" is not set in sign.env file');
  if (!AZURE_CLIENT_SECRET) throw Error('Env variable "AZURE_CLIENT_SECRET" is not set in sign.env file');
  if (!TRUSTEDSIGNING_ACCOUNT_NAME) throw Error('Env variable "TRUSTEDSIGNING_ACCOUNT_NAME" is not set in sign.env file');
  if (!TRUSTEDSIGNING_PROFILE_NAME) throw Error('Env variable "TRUSTEDSIGNING_PROFILE_NAME" is not set in sign.env file');
  const access_token = await getAccessToken({ AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET });
  const options = {
    alg: algoritm(hash),
    alias: `${TRUSTEDSIGNING_ACCOUNT_NAME}/${TRUSTEDSIGNING_PROFILE_NAME}`,
    keystore: `weu.codesigning.azure.net`,
    storetype: `TRUSTEDSIGNING`,
    storepass: access_token,
  };
  const params = Object.keys(options).map((key) => `--${key} ${options[key]}`);
  const command = `java -jar ${jar} ${params.join(" ")} "${path}"`;
  execSync(command, { stdio: "inherit" });
}
