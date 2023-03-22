#!/usr/bin/env node
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

/** Attempt to get a named binary from the first argument, fallback to default binary. */
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
const maybeBinaryName = args.at(0);
const binPath = await tryGetBinPath(maybeBinaryName);

if(!binPath) {
	exit({message: "No binary found."});
}

try {
	await execa(binPath!, args, {stdio: "inherit"});
} catch(error: unknown) {
	const potentialError = error as ExecaError | undefined;
	exit({exitCode: potentialError?.exitCode});
}
