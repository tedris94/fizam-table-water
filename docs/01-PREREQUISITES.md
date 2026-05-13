# 01 · Prerequisites

You only need these once, before running the project. Skip any step that you already have.

## 1. Install Node.js 24.14.1 (or newer 24.x)

The project targets **Node 24 LTS** (see `package.json` → `engines` and `.nvmrc`). **24.14.1** matches Namecheap’s cPanel selector and GitHub Actions.

### Easiest way (Windows): use `nvm-windows`

1. Open https://github.com/coreybutler/nvm-windows/releases.
2. Download `nvm-setup.exe` and run it (accept defaults).
3. Open a new **Command Prompt** as Administrator and run:

   ```bat
   nvm install 24.14.1
   nvm use 24.14.1
   node -v
   ```

   You should see `v24.14.1`.

### Without nvm

Download the Windows installer from  
https://nodejs.org/dist/v24.14.1/node-v24.14.1-x64.msi  
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
node -v       :: prints v24.14.1 (or another 24.x that satisfies engines)
npm -v        :: prints 10.x.x
git --version :: prints git version 2.x
```

If all three commands print versions, you are ready. Continue with `02-PROJECT-STRUCTURE.md`.
