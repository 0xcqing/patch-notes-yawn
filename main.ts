import { mkdirSync, writeFileSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "v5.2.0: fixed a bug where another user's yawn forced a local yawn. Rollout complete; adoption remains contagious.";

function fail(message: string): never {
  console.error(`FAILED: ${message}`);
  process.exit(1);
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });

const content = `${ENTRY}\n`;

const chars = [...ENTRY].length;
const bytes = Buffer.byteLength(content, "utf8");

if (ENTRY.trim().length === 0) {
  fail("entry is empty after trim");
}
if (/[\r\n\u2028\u2029]/.test(ENTRY)) {
  fail("entry contains a line break inside the line");
}
if (chars < 1 || chars > 160) {
  fail(`entry length ${chars} is outside 1..160 characters`);
}
if (bytes < 1 || bytes > 160) {
  fail(`entry byte length ${bytes} is outside 1..160 bytes`);
}

const filePath = join(outputDir, "entry.txt");
writeFileSync(filePath, content, { encoding: "utf8" });

const onDisk = readFileSync(filePath);
const expected = Buffer.from(content, "utf8");
if (!onDisk.equals(expected)) {
  fail(
    `read-back bytes differ from written bytes ` +
      `(read ${onDisk.length} bytes, wrote ${expected.length})`,
  );
}
const onDiskSize = statSync(filePath).size;
if (onDiskSize !== expected.length) {
  fail(`file size ${onDiskSize} does not match expected ${expected.length} bytes`);
}
if (onDisk.length !== Buffer.byteLength(`${ENTRY}\n`, "utf8")) {
  fail("file is not exactly the line plus one trailing newline");
}
if (onDisk[onDisk.length - 1] !== 0x0a) {
  fail("file does not end with a single trailing newline byte (0x0a)");
}

console.log(`characters: ${chars}`);
console.log(`bytes (entry, no newline): ${Buffer.byteLength(ENTRY, "utf8")}`);
console.log(`file size: ${onDiskSize}`);
console.log(`line: ${ENTRY}`);
