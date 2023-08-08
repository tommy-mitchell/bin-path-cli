import process from "node:process";
import { getBinPath } from "get-bin-path";

type ExitArgs = {
	message?: string;
	exitCode?: number;
};

/** Exit with an optional error message. */
export const exit = ({ message, exitCode = 1 }: ExitArgs = {}): never => {
	if (message) {
		console.error(message);
	}

	process.exit(exitCode);
};

type TryGetBinPathArgs = {
	args: typeof process.argv;
	binaryName?: string;
};

/** Attempt to get a named binary from the first argument, or fallback to default binary. */
export const tryGetBinPath = async ({ args, binaryName }: TryGetBinPathArgs): ReturnType<typeof getBinPath> => {
	if (binaryName) {
		const binPath = await getBinPath({ name: binaryName });

		if (binPath) {
			args.shift();
			return binPath;
		}
	}

	return getBinPath();
};
