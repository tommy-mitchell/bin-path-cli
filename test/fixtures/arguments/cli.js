#!/usr/bin/env node
import meow from 'meow';

const cli = meow({
	importMeta: import.meta,
});

const {input} = cli;

console.log(`Arguments: [${input.join(", ")}]`);
