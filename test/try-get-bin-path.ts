import test from "ava";
import esmock from "esmock";
import { spy } from "testtriple";

type MacroArgs = [{
	args: string[];
	mockResolves?: "binary path" | "undefined";
	expectations: {
		args?: string[];
		binPath: string;
	};
}];

const verifyHelper = test.macro<MacroArgs>(async (t, { args, mockResolves, expectations }) => {
	const assertions = await t.try(async tt => {
		const { tryGetBinPath } = await esmock("../src/helpers.ts", {
			"get-bin-path": {
				getBinPath: mockResolves ? spy(
					async () => mockResolves === "undefined" ? undefined : "binary path",
					// @ts-expect-error: testtriple types are incorrect
					async () => "default binary path",
				) : async () => "default binary path",
			},
		}) as typeof import("../src/helpers.js"); // eslint-disable-line @typescript-eslint/consistent-type-imports

		const testedArgs = [...args];
		const binPath = await tryGetBinPath({ args: testedArgs });

		tt.is(binPath, expectations.binPath);

		if (expectations.args) {
			tt.deepEqual(testedArgs, expectations.args);
		}
	});

	if (!assertions.passed) {
		t.log("args:", args);
		t.log("mockResolves:", mockResolves);
		t.log("expectations:", expectations);
	}

	assertions.commit();
});

test("no binary name - attempts to get default binary", verifyHelper, {
	args: [],
	expectations: {
		binPath: "default binary path",
	},
});

test("binary name - falls back to finding default binary if not found", verifyHelper, {
	args: ["foo", "--bar"],
	mockResolves: "undefined",
	expectations: {
		binPath: "default binary path",
	},
});

test("binary name - returns binary path if found and removes first argument", verifyHelper, {
	args: ["foo", "--bar"],
	mockResolves: "binary path",
	expectations: {
		args: ["--bar"],
		binPath: "binary path",
	},
});
