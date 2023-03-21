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
# in a directory with your `package.json`
$ bin-path --some-flag arg1 arg2
```

## Related

- [get-bin-path](https://github.com/ehmicky/get-bin-path) - The library used to build this.
