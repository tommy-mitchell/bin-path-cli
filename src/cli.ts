#!/usr/bin/env ts-node-esm
import process from "node:process";
import { execa, type ExecaError } from "execa";
import { exit, tryGetBinPath, tryMapBinPath } from "./helpers.js";

// First two arguments are Node binary and this binary
const args = process.argv.slice(2);

const firstArg = args.at(0);
const shouldMap = firstArg?.includes(":::");

if (shouldMap) {
	args.shift();
}

let binPath = await tryGetBinPath({ args });

if (!binPath) {
	exit({ message: "No binary found. Usage: `$ npx bin-path [source-map] [binary-name] [arguments or flags…]`" });
}

if (shouldMap) {
	binPath = tryMapBinPath({ binPath: binPath!, map: firstArg! });
}

try {
	await execa(binPath!, args, { preferLocal: true, stdio: "inherit" });
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
