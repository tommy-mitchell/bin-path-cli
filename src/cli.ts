#!/usr/bin/env node
import process from "node:process";
import {getBinPath} from "get-bin-path";
import {execa, type ExecaError} from "execa";

type ExitOptions = {
	message?: string;
	exitCode?: number;
};

const exit = ({message, exitCode = 1}: ExitOptions = {}) => {
	if(message) {
		console.error(message);
	}

	process.exit(exitCode);
};

const binPath = await getBinPath();

if(!binPath) {
	exit({message: "No binary found."});
}

// First two arguments are Node binary and this binary
const args = process.argv.slice(2);

try {
	await execa(binPath!, args, {stdio: "inherit"});
} catch(error: unknown) {
	const potentialError = error as ExecaError | undefined;
	exit({exitCode: potentialError?.exitCode});
}
