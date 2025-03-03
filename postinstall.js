const { writeFileSync, readFileSync, existsSync } = require("node:fs");

const env_path = "../../sign.env";
const key_path = "../../sign.key";
const gitignore_path = "../../.gitignore";

const env =
  'AZURE_TENANT_ID=""\n' +
  'AZURE_CLIENT_ID=""\n' +
  'AZURE_CLIENT_SECRET=""\n' +
  'TRUSTEDSIGNING_ACCOUNT_NAME=""\n' +
  'TRUSTEDSIGNING_PROFILE_NAME=""\n';

if (!existsSync(env_path)) writeFileSync(env_path, env, "utf8");
if (!existsSync(key_path)) writeFileSync(key_path, "", "utf8");

const gitignore = existsSync(gitignore_path) ? readFileSync(gitignore_path, "utf8") : "";
const flag = gitignore ? "a" : undefined;
const has_env_ignore = /^sign\.env$/gm.test(gitignore);
const has_key_ignore = /^sign\.key$/gm.test(gitignore);
if (!has_env_ignore && !has_key_ignore) {
  writeFileSync(gitignore_path, "\n" + "sign.key" + "\n" + "sign.env", { flag, encoding: "utf8" });
} else {
  if (!has_env_ignore) {
    writeFileSync(gitignore_path, "\n" + "sign.env", { flag, encoding: "utf8" });
  }
  if (!has_key_ignore) {
    writeFileSync(gitignore_path, "\n" + "sign.key", { flag, encoding: "utf8" });
  }
}
