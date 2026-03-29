// electron/main.js
import { app, BrowserWindow, Menu, globalShortcut, ipcMain } from 'electron';
import path from 'node:path';
import { fork } from 'child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The built directory structure
process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');

let mainWindow;
let backendProcess;
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

function startBackend() {
  const serverPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'backend', 'server.js')
    : path.join(__dirname, '../backend/server.js');
    
  backendProcess = fork(serverPath, [], {
    cwd: app.isPackaged ? path.join(process.resourcesPath, 'backend') : path.join(__dirname, '../backend'),
    env: { ...process.env, PORT: '5000' },
    stdio: 'pipe'
  });

  backendProcess.stdout?.on('data', (data) => console.log(`[Backend]: ${data.toString()}`));
  backendProcess.stderr?.on('data', (data) => console.error(`[Backend API Error]: ${data.toString()}`));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    // kiosk: true, // Typical for POS - forces fullscreen kiosk
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Disabled for local dev fetches 
    },
    show: false,
  });

  Menu.setApplicationMenu(null); // Hide default menu for POS

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(process.env.DIST, 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Example POS shortcuts
  globalShortcut.register('F11', () => {
    const isFullScreen = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFullScreen);
  });
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    mainWindow.webContents.toggleDevTools();
  });
}

// POS Hardware IPC Handlers
ipcMain.on('print-receipt', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.webContents.print({ silent: true, color: false, copies: 1 }, (success, failureReason) => {
      if (!success) console.error('Silent print failed:', failureReason);
    });
  }
});

ipcMain.handle('get-printers', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    return win.webContents.getPrintersAsync();
  }
  return [];
});

ipcMain.on('open-devtools', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.webContents.openDevTools();
  }
});

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
