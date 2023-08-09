#!/usr/bin/env ts-node-esm
import meow from "meow";

const cli = meow({
	importMeta: import.meta,
	flags: {
		foo: {
			type: "string",
		},
	},
});

console.log(cli.flags.foo);
