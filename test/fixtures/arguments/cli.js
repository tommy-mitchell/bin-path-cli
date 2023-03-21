#!/usr/bin/env node
import meow from 'meow';

const cli = meow("$ arguments [...]", {
	importMeta: import.meta,
});

const {input} = cli;

// Show help if no arguments
if(input.length === 0) {
	cli.showHelp(0);
}

console.log(`Arguments: [${input.join(", ")}]`);
