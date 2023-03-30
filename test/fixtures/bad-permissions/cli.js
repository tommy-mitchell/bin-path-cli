#!/usr/bin/env node
import meow from "meow";

const cli = meow("Hello, world!", {
	importMeta: import.meta,
});

console.log(cli.help);
