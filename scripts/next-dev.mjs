import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const forwarded = process.argv.slice(2);
let hostname = "0.0.0.0";
let port = "3000";
const extra = [];

for (let index = 0; index < forwarded.length; index += 1) {
  const arg = forwarded[index];
  if (arg === "--host" || arg === "--hostname") {
    hostname = forwarded[index + 1] ?? hostname;
    index += 1;
  } else if (arg === "--port" || arg === "-p") {
    port = forwarded[index + 1] ?? port;
    index += 1;
  } else if (arg !== "--strictPort") {
    extra.push(arg);
  }
}

const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const child = spawn(process.execPath, [nextBin, "dev", "--hostname", hostname, "--port", port, ...extra], {
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
