import test from "ava";
import esmock from "esmock";
import stripAnsi from "strip-ansi";

type MacroArgs = [{
	exitCode?: number;
	message?: string;
}];

const verifyHelper = test.macro<MacroArgs>(async (t, { exitCode = 1, message = "" }) => {
	const verify = (actual: unknown, expected: unknown, name: string) => {
		const passed = t.is(actual, expected);

		if (!passed) {
			t.log(`${name}:`, expected);
		}
	};

	/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/consistent-type-imports */
	const { exit } = await esmock("../src/helpers.ts", {
		"node:process": {
			exit: (code: number) => verify(code, exitCode, "exit code"),
		},
		import: {
			console: {
				error: (errorMessage: string) => verify(stripAnsi(errorMessage), `✖ ${message}`, "message"),
			},
		},
	}) as typeof import("../src/helpers.js");
	/* eslint-enable @typescript-eslint/naming-convention, @typescript-eslint/consistent-type-imports */

	exit({ exitCode, message });
});

test("exits with code 1 and no message by default", verifyHelper, {
	exitCode: 1,
	message: "",
});

test("exits with given code", verifyHelper, {
	exitCode: 2,
});

test("exits with given message", verifyHelper, {
	message: "error message",
});
