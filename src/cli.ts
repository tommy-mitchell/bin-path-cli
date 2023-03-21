#!/usr/bin/env node
import process from "node:process";
import {getBinPath} from "get-bin-path";
import {execa} from "execa";

const exit = (message?: string) => {
	if(message) {
		console.error(message);
	}

	process.exit(1);
};

const binPath = await getBinPath();

if(!binPath) {
	exit("No binary found.");
}

try {
	await execa(binPath!, process.argv, {stdio: "inherit"});
} catch {
	exit();
}
