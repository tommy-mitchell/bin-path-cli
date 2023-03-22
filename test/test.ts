import {fileURLToPath} from "node:url";
import path from "node:path";
import anyTest, {type TestFn} from "ava";
import {execa, type Options, type ExecaError} from "execa";
import {getBinPath} from "get-bin-path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const test = anyTest as TestFn<{
	binPath: string;
}>;

test.before("get bin path", async t => {
	const binPath = await getBinPath();

	t.truthy(binPath, "No bin path found!");

	t.context.binPath = binPath!;
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
	t.is(error?.stderr, "No binary found.");
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
	t.is(error?.stderr, "No binary found.");
});
