import test from "ava";
import { tryMapBinPath } from "../src/helpers.js";

type MacroArgs = [{
	binPath: string;
	map: string;
	expected: string;
}];

const verifyHelper = test.macro<MacroArgs>((t, { binPath, map, expected }) => {
	const passed = t.is(tryMapBinPath({ binPath, map }), expected);

	if (!passed) {
		t.log("binPath:", binPath);
		t.log("map:", map);
		t.log("expected:", expected);
	}
});

test("maps dist to source", verifyHelper, {
	binPath: "dist/foo.js",
	map: "dist.js:::src.ts",
	expected: "src/foo.ts",
});

test("works with different map", verifyHelper, {
	binPath: "build/foo.js",
	map: "build.js:::source.ts",
	expected: "source/foo.ts",
});

test("has no effect if map is invalid", verifyHelper, {
	binPath: "dist/foo.js",
	map: "dist:::src",
	expected: "dist/foo.js",
});

