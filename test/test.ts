import {fileURLToPath} from "node:url";
import path from "node:path";
import anyTest, {type TestFn} from "ava";
import {execa, type Options, type ExecaError} from "execa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const test = anyTest as TestFn<{
	binPath: string;
	helpText: string;
}>;

test.before("setup context", t => {
	t.context.binPath = path.resolve(__dirname, "../src/cli.ts");
	t.context.helpText = "Usage: `$ npx bin-path [binary-name] [arguments or flags…]`";
});

const atFixture = (name: string): Options => ({cwd: `${__dirname}/fixtures/${name}`});

test("main", async t => {
	const {exitCode, stdout} = await execa(t.context.binPath, ["--foo=bar"], atFixture("success"));

	t.is(exitCode, 0);
	t.is(stdout, "bar");
});

test("fail", async t => {
	const error = await t.throwsAsync<ExecaError>(
		execa(t.context.binPath, [], atFixture("failure")),
	);

	t.is(error?.exitCode, 2);
	t.is(error?.stderr, "Missing required flag\n\t--foo");
});

test("no bin", async t => {
	const error = await t.throwsAsync<ExecaError>(
		execa(t.context.binPath, [], atFixture("no-bin")),
	);

	t.is(error?.exitCode, 1);
	t.is(error?.stderr, `No binary found. ${t.context.helpText}`);
});

test("accepts arguments", async t => {
	const run = async (args: string[], expected: string) => {
		const {exitCode, stdout} = await execa(t.context.binPath, args, atFixture("arguments"));

		t.is(exitCode, 0);
		t.is(stdout.trim(), expected);
	};

	await run([], "Arguments: []");
	await run(["1", "2", "3"], "Arguments: [1, 2, 3]");
});

test("named binary - with default", async t => {
	const run = async (args: string[], expected: string) => {
		const {exitCode, stdout} = await execa(t.context.binPath, args, atFixture("named-binaries/with-default"));

		t.is(exitCode, 0);
		t.is(stdout, expected);
	};

	await run(["foo"], "foo");
	await run(["bar"], "bar");
	await run([], "foo");
});

test("named binary - no default", async t => {
	const run = async (args: string[], expected: string) => {
		const {exitCode, stdout} = await execa(t.context.binPath, args, atFixture("named-binaries/no-default"));

		t.is(exitCode, 0);
		t.is(stdout, expected);
	};

	await run(["foo"], "foo");
	await run(["bar"], "bar");

	const error = await t.throwsAsync<ExecaError>(execa(t.context.binPath, [], atFixture("named-binaries/no-default")));

	t.is(error?.exitCode, 1);
	t.is(error?.stderr, `No binary found. ${t.context.helpText}`);
});

test("handles incorrect execute permissions", async t => {
	const error = await t.throwsAsync<ExecaError>(
		execa(t.context.binPath, [], atFixture("bad-permissions")),
	);

	t.is(error?.exitCode, 1);
	t.is(error?.stderr, "The binary could not be executed. Does it have the right permissions?");
});

test("missing binary", async t => {
	const error = await t.throwsAsync<ExecaError>(
		execa(t.context.binPath, [], atFixture("missing-binary")),
	);

	t.is(error?.exitCode, 1);
	t.is(error?.stderr, "The binary does not exist. Does it need to be built?");
});
