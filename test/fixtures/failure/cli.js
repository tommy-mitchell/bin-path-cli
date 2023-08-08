#!/usr/bin/env node
import meow from "meow";

const cli = meow({
	importMeta: import.meta,
	flags: {
		foo: {
			type: "string",
			isRequired: true,
		},
	},
});

console.log(cli.flags.foo);
