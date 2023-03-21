import {fileURLToPath} from "node:url";
import path from "node:path";
import anyTest, {type TestFn} from "ava";
import {execa, type Options} from "execa";
import {getBinPath} from "get-bin-path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const test = anyTest as TestFn<{
	binPath: string;
}>;

type ExecaError = {
	readonly exitCode: number;
	readonly stderr: any;
} & Error;

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

	t.is(error?.exitCode, 1);
	t.is(error?.stderr, "Missing required flag\n\t--foo");
});

test("no bin", async t => {
	const error = await t.throwsAsync<ExecaError>(
		execa(t.context.binPath, [], atFixture("no-bin")),
	);

	t.is(error?.exitCode, 1);
	t.is(error?.stderr, "No binary found.");
});
