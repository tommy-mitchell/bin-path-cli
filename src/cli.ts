#!/usr/bin/env tsx
import process from "node:process";
import {getBinPath} from "get-bin-path";
import {execa, type ExecaError} from "execa";

type ExitOptions = {
	message?: string;
	exitCode?: number;
};

/** Exit with an optional error message. */
const exit = ({message, exitCode = 1}: ExitOptions = {}) => {
	if(message) {
		console.error(message);
	}

	process.exit(exitCode);
};

// First two arguments are Node binary and this binary
const args = process.argv.slice(2);

/** Attempt to get a named binary from the first argument, or fallback to default binary. */
const tryGetBinPath = async (binaryName?: string): ReturnType<typeof getBinPath> => {
	if(binaryName) {
		const binPath = await getBinPath({name: binaryName});

		if(binPath) {
			args.shift();
			return binPath;
		}

		return tryGetBinPath();
	}

	return getBinPath();
};

// First argument could be a named binary to use
const maybeBinaryName = args[0] ?? undefined;
const binPath = await tryGetBinPath(maybeBinaryName);

if(!binPath) {
	exit({message: "No binary found. Usage: `$ npx bin-path [binary-name] [arguments or flags…]`"});
}

try {
	await execa(binPath!, args, {stdio: "inherit"});
} catch(error: unknown) {
	const potentialError = error as ExecaError | undefined;

	if(potentialError?.shortMessage.includes("EACCES")) {
		exit({message: "The binary could not be executed. Does it have the right permissions?"});
	}

	if(potentialError?.shortMessage.includes("ENOENT")) {
		exit({message: "The binary does not exist. Does it need to be built?"});
	}

	exit({exitCode: potentialError?.exitCode});
}
