import { app, BrowserWindow } from 'electron';
import { PianoConnector } from './piano-connector';

function createWindow (): BrowserWindow {
  // Create a browser window
  const appWindow: BrowserWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 500,
    webPreferences: {
      nodeIntegration: true
    }
  })
  appWindow.loadFile('index.html');

  return appWindow;
}

// Called when Electron has finished initialization
// and is ready to create browser windows
app.on('ready', () => {
  const appWindow: BrowserWindow = createWindow();
  appWindow.on('ready-to-show', () => {
    appWindow.show();
    new PianoConnector(appWindow);
  });
});

// Close app when all windows are closed except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});