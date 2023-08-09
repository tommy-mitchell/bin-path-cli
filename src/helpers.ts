import process from "node:process";
import { getBinPath } from "get-bin-path";
import type { Match } from "./types.js";

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
};

/** Attempt to get a named binary from the first argument, or fallback to default binary. */
export const tryGetBinPath = async ({ args }: TryGetBinPathArgs): ReturnType<typeof getBinPath> => {
	// First argument could be a named binary to use
	const binaryName = args.at(0);

	if (binaryName) {
		const binPath = await getBinPath({ name: binaryName });

		if (binPath) {
			args.shift();
			return binPath;
		}
	}

	return getBinPath();
};

/** https://regex101.com/r/OLVdtN/1 */
const mapRegex = /(?<dPath>[^.]+)(?<dExt>\.\w+):::(?<sPath>[^.]+)(?<sExt>\.\w+)/;

type MapBinPathArgs = {
	binPath: string;
	map: string;
};

/** Maps built binary to source binary if possible. */
export const tryMapBinPath = ({ binPath, map }: MapBinPathArgs): string => {
	const match = map.match(mapRegex) as Match<"dPath" | "dExt" | "sPath" | "sExt">;

	if (!match) {
		return binPath;
	}

	const {
		dPath: distPath, dExt: distExtension,
		sPath: sourcePath, sExt: sourceExtension,
	} = match.groups;

	return binPath.replace(distPath, sourcePath).replace(distExtension, sourceExtension);
};
