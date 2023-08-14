import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import anyTest, { type TestFn } from "ava";
import { Semaphore, type Permit } from "@shopify/semaphore";
import { getBinPath } from "get-bin-path";
import { isExecutable } from "is-executable";
import { execa, type ExecaError } from "execa";

const test = anyTest as TestFn<{
	binPath: string;
	permit: Permit;
}>;

const helpText = "Usage: `$ npx bin-path [source-map] [binary-name] [arguments or flags…]`";

test.before("setup context", async t => {
	const binPath = await getBinPath();
	t.truthy(binPath, "No bin path found!");

	t.context.binPath = binPath!.replace("dist", "src").replace(".js", ".ts");
	t.true(await isExecutable(t.context.binPath), "Source binary not executable!");
});

// https://github.com/avajs/ava/discussions/3177
const semaphore = new Semaphore(Number(process.env["concurrency"]) || 5);

test.beforeEach("setup concurrency", async t => {
	t.context.permit = await semaphore.acquire();
});

test.afterEach.always(async t => {
	await t.context.permit.release();
});

type VerifyCliArgs = {
	/** Resolved relative to `test/fixtures` */
	fixture: string;
	args?: string;
	expectations: (
		| { stdout: string }
		| { stderr: string; exitCode: number }
	);
};

const cliExpectedToPass = (expectations: VerifyCliArgs["expectations"]): expectations is { stdout: string } => (
	(expectations as { stdout: string }).stdout !== undefined
);

const verifyCli = test.macro(async (t, { fixture, args: rawArgs, expectations }: VerifyCliArgs) => {
	const cwd = path.resolve(fileURLToPath(import.meta.url), "..", "fixtures", ...fixture.split("/"));
	const args = rawArgs?.split(" ") ?? [];

	const assertions = await t.try(async tt => {
		if (cliExpectedToPass(expectations)) {
			tt.log("stdout:", expectations.stdout);
			const { exitCode, stdout } = await execa(tt.context.binPath, args, { cwd });

			tt.is(exitCode, 0);
			tt.is(stdout, expectations.stdout);
		} else {
			tt.log("stderr:", expectations.stderr);
			tt.log("exitCode:", expectations.exitCode);

			const error = await tt.throwsAsync<ExecaError>(
				execa(tt.context.binPath, args, { cwd }),
			);

			tt.is(error?.exitCode, expectations.exitCode);
			tt.is(error?.stderr, expectations.stderr);
		}
	});

	if (!assertions.passed) {
		t.log("fixture:", fixture);
		t.log("args:", args);
	}

	assertions.commit({ retainLogs: !assertions.passed });
});

test("main", verifyCli, {
	fixture: "success",
	args: "--foo=bar",
	expectations: {
		stdout: "bar",
	},
});

test("fail", verifyCli, {
	fixture: "failure",
	expectations: {
		exitCode: 2,
		stderr: "Missing required flag\n\t--foo",
	},
});

test("no bin", verifyCli, {
	fixture: "no-bin",
	expectations: {
		exitCode: 1,
		stderr: `No binary found. ${helpText}`,
	},
});

test("no arguments", verifyCli, {
	fixture: "arguments",
	expectations: {
		stdout: "Arguments: []",
	},
});

test("accepts arguments", verifyCli, {
	fixture: "arguments",
	args: "1 2 3",
	expectations: {
		stdout: "Arguments: [1, 2, 3]",
	},
});

test("named binary - with default - default", verifyCli, {
	fixture: "named-binaries/with-default",
	expectations: {
		stdout: "foo",
	},
});

test("named binary - with default - named default", verifyCli, {
	fixture: "named-binaries/with-default",
	args: "foo",
	expectations: {
		stdout: "foo",
	},
});

test("named binary - with default - named non-default", verifyCli, {
	fixture: "named-binaries/with-default",
	args: "bar",
	expectations: {
		stdout: "bar",
	},
});

test("named binary - no default - errors", verifyCli, {
	fixture: "named-binaries/no-default",
	expectations: {
		exitCode: 1,
		stderr: `No binary found. ${helpText}`,
	},
});

test("named binary - no default - named one", verifyCli, {
	fixture: "named-binaries/no-default",
	args: "foo",
	expectations: {
		stdout: "foo",
	},
});

test("named binary - no default - named two", verifyCli, {
	fixture: "named-binaries/no-default",
	args: "bar",
	expectations: {
		stdout: "bar",
	},
});

test("handles incorrect execute permissions", verifyCli, {
	fixture: "bad-permissions",
	expectations: {
		exitCode: 1,
		stderr: "The binary could not be executed. Does it have the right permissions?",
	},
});

test("missing binary", verifyCli, {
	fixture: "missing-binary",
	expectations: {
		exitCode: 1,
		stderr: "The binary does not exist. Does it need to be built?",
	},
});

test("maps dist to src", verifyCli, {
	fixture: "map",
	args: "build.js:::source.ts --foo=bar",
	expectations: {
		stdout: "bar",
	},
});
