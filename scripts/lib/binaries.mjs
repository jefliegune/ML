import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const extension = process.platform === "win32" ? ".exe" : "";

const findBundled = (name) => {
  const scope = path.join(root, "node_modules", "@remotion");
  if (!fs.existsSync(scope)) {
    return null;
  }

  const packages = fs
    .readdirSync(scope, {withFileTypes: true})
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("compositor-"));

  for (const pkg of packages) {
    const candidate = path.join(scope, pkg.name, `${name}${extension}`);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
};

const findOnPath = (command) => {
  const probe = spawnSync(command, ["-version"], {stdio: "ignore"});
  return probe.status === 0 ? command : null;
};

/**
 * Resolve a media binary in this order:
 * 1. explicit environment variable
 * 2. the compositor package bundled with Remotion
 * 3. a system installation on PATH
 */
export const resolveBinary = (name, envVar) => {
  const fromEnv = process.env[envVar];
  if (fromEnv && fs.existsSync(fromEnv)) {
    return fromEnv;
  }

  const bundled = findBundled(name);
  if (bundled) {
    return bundled;
  }

  return findOnPath(`${name}${extension}`);
};

export const requireBinary = (name, envVar) => {
  const resolved = resolveBinary(name, envVar);
  if (!resolved) {
    console.error(
      `Could not find ${name}. Reinstall dependencies (npm install) or set ${envVar}.`,
    );
    process.exit(1);
  }
  return resolved;
};
