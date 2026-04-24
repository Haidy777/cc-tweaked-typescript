# cc-tweaked-typescript

TypeScript-first development for [CC:Tweaked](https://tweaked.cc/) (ComputerCraft) in Minecraft.

Basically years back I started writing some typescript stuff for my [ATM 9 Lets play](https://github.com/Haidy777/allthemods9-cctweaked) but eventually abandoned it, with the power of [Claude Code](https://claude.ai/claude-code) I thought it might be time to start over again for my new [FTB Stoneblock 4 series](https://www.youtube.com/watch?v=UyYfsUXR7R4&list=PLEigNmGkw2xj0-PFHyvkT8K0urZTVSh3J) much of the boilerplate code was written and ported from the old repo by claude code. I intend to add a bunch of scripts over the next few months or weeks and try to keep this updated but I can't gurantee it, so feel free to open issues, pull requests or fork.  There is a handy installer ready if you just want to get started.

Since I'm a nodejs (mostly backend) developer the thought wasn't that far off to work with typescript and let [typescript-to-lua](https://typescripttolua.github.io/) handle the heavy lifting to get lua code. Sure lua isn't that complicated but why learn something new again, if you know something already?

## On "Vibe Coding"

> Most of this repo is built with [Claude Code](https://claude.ai/claude-code). I'll make sure vibed code is visible in commits and changelogs. The goal is a working, type-safe CC:Tweaked development setup — Claude handles the scaffolding and boilerplate, I handle the game logic and testing in Minecraft.

## Quick Start

```bash
npm install
npm run build
```

Copy files from `build/` to your ComputerCraft computer directory, or use the in-game installer:

### In-Game Installer

Run this on any CC:Tweaked computer to get the installer:

```
wget https://raw.githubusercontent.com/Haidy777/cc-tweaked-typescript/refs/heads/main/build/scripts/installer.lua installer
```

Then use it to download scripts:

```
installer list              # Show available scripts and libraries
installer install <name>    # Install a specific file
installer install all       # Install everything
installer update            # Update all installed files
installer self-update       # Update the installer itself
```

## Architecture

```
src/
  types/        CC:Tweaked API types missing from computercraft-types
  lib/
    manifest.ts   Shared manifest/HTTP/file utilities
    updater.ts    Auto-update library for scripts
    turtle/       Turtle-specific libs (bot, detect, navigation)
  scripts/        Standalone programs → compiled to .lua files
build/            Compiled Lua output (committed for in-game downloading)
manifest.json     Auto-generated file listing for the installer
```

## Tech Stack

- [TypeScript](https://www.typescriptlang.org/) with strict mode
- [typescript-to-lua](https://typescripttolua.github.io/) (tstl) for Lua 5.1 compilation
- [computercraft-types](https://github.com/BlockOG/TS-CC-Types) for CC:Tweaked API declarations
- [Biome](https://biomejs.dev/) for linting and formatting

## Related Projects

- [CC:Tweaked Documentation](https://tweaked.cc/)
- [TypeScript to Lua](https://typescripttolua.github.io/)
- [computercraft-types](https://github.com/BlockOG/TS-CC-Types)
- [Basalt UI Framework](https://github.com/Pyroxenium/Basalt)

## Note from Claude Code

> I helped Philipp set up this project from scratch in a single session — project scaffolding, tsconfig, biome, the full type declarations for CC:Tweaked APIs that `computercraft-types` was missing (fs, textutils, shell, the Lua string library, and a bunch of builtins like pcall and pairs), plus a manifest-driven installer system with auto-updates. The Bot class was ported over from the old ATM 9 repo with four bug fixes (the old `back()` was secretly calling `forward()`, inventory check was inverted, backtracking always threw, and goTo only moved one block on the Z axis). We landed on `require-minimal` for tstl's lualib which keeps polyfill bundles tiny — the installer itself compiles to clean Lua with zero runtime dependencies. Next up: actual mining and automation scripts for the FTB Stoneblock 4 series, and eventually Basalt UI types.

## My other Projects

- [Tavrik](https://github.com/Haidy777/tavrik?tab=readme-ov-file) - An opinionated chat bot interface, with tool calling, model selections, prompts and stuff. Worth taking a look if you're interested in chat bots.
- [Haidy777.com](https://haidy777.com/) - My Lets play and YouTube website
- [Haidy777](https://www.youtube.com/@Haidy777) - YouTube channel
- [Personal Blog and CV](https://blog.phaidenbauer.com/)

## License

MIT
