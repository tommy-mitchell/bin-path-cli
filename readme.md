# bin-path-cli

Execute the current package's binary.

<p align="center"><img src="media/demo.gif"></p>

Like using `npm link`, but doesn't add your binary to the global path.

*Demo with [`listr-cli`](https://github.com/tommy-mitchell/listr-cli).*

## Install

```sh
node install --save-dev bin-path-cli
```

<details>
<summary>Other Package Managers</summary>

```sh
yarn add --dev bin-path-cli
```
</details>

*Uses top-level await. Requires Node 14.8 or higher.*

## Usage

```sh
npx bin-path [binary-name] [arguments or flags…]
```

### Cuurent Working Directory

Inside of a directory with a `package.json` that specifies a binary either via `bin` or `directories.bin`, run via:

```sh
npx bin-path
```

If no binary is found, the `bin-path` command fails.

### Arguments

Flags and arguments are passed as-is to your binary:

```sh
$ npx bin-path --some-flag arg1 arg2
```

<details>
<summary>Example</summary>

```js
// cli.js
#!/usr/bin/env node
import meow from "meow";

const {input} = meow({importMeta: import.meta});
console.log(`Arguments: [${input.join(", ")}]`);
```

```sh
$ npx bin-path arg1 arg2
#=> "Arguments: [arg1, arg2]"
```
</details>

### Named binaries

If you have multiple exported binaries, they can be accessed by name if passed as the first argument to `bin-path`:

```sh
$ npx bin-path binary-name
```

<details>
<summary>Example</summary>

```jsonc
// package.json
"bin": {
	"foo": "./foo.js",
	"bar": "./bar.js"
}
```

```sh
# `foo` binary
$ npx bin-path foo --foo-flag

# `bar` binary
$ npx bin-path bar --bar-flag
```
</details>

## Related

- [get-bin-path](https://github.com/ehmicky/get-bin-path) - Get the current package's binary path.
