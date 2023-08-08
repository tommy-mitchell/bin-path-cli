#!/usr/bin/env tsx
import process from "node:process";
import { execa, type ExecaError } from "execa";
import { tryGetBinPath, exit } from "./helpers.js";

// First two arguments are Node binary and this binary
const args = process.argv.slice(2);

// First argument could be a named binary to use
const maybeBinaryName = args.at(0);
const binPath = await tryGetBinPath({ args, binaryName: maybeBinaryName });

if (!binPath) {
	exit({ message: "No binary found. Usage: `$ npx bin-path [binary-name] [arguments or flags…]`" });
}

try {
	await execa(binPath!, args, { stdio: "inherit" });
} catch (error: unknown) {
	const potentialError = error as ExecaError | undefined;

	if (potentialError?.shortMessage.includes("EACCES")) {
		exit({ message: "The binary could not be executed. Does it have the right permissions?" });
	}

	if (potentialError?.shortMessage.includes("ENOENT")) {
		exit({ message: "The binary does not exist. Does it need to be built?" });
	}

	exit({ exitCode: potentialError?.exitCode });
}
