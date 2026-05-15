# 01 · Prerequisites

You only need these once, before running the project. Skip any step that you already have.

## 1. Install Node.js 24.15.0 (or any 24.x in `package.json` engines)

The project uses **Node 24** (see `package.json` → `engines` and `.nvmrc`). **24.15.0** matches Namecheap’s current cPanel option and GitHub Actions.

### Easiest way (Windows): use `nvm-windows`

1. Open https://github.com/coreybutler/nvm-windows/releases.
2. Download `nvm-setup.exe` and run it (accept defaults).
3. Open a new **Command Prompt** as Administrator and run:

   ```bat
   nvm install 24.15.0
   nvm use 24.15.0
   node -v
   ```

   You should see `v24.15.0`.

### Without nvm

Download the Windows installer from  
https://nodejs.org/dist/v24.15.0/node-v24.15.0-x64.msi  
run it, then verify with `node -v`.

## 2. Install Git (recommended)

https://git-scm.com/downloads — accept all defaults.

## 3. Install Visual Studio Code

https://code.visualstudio.com — free editor. After installing, open it once and install the “TypeScript” extension when prompted.

## 4. Optional but useful

- **WAMP** (https://www.wampserver.com) — already installed if you can see this project under `C:\wamp64\www`.
- **Beekeeper Studio** (https://www.beekeeperstudio.io) — to peek inside the SQLite database file in `data/fizam.db`.

## ✅ Check everything

Open Command Prompt (or PowerShell) and run:

```bat
node -v       :: prints v24.15.0 (or another 24.x that satisfies engines)
npm -v        :: prints 10.x.x
git --version :: prints git version 2.x
```

If all three commands print versions, you are ready. Continue with `02-PROJECT-STRUCTURE.md`.
