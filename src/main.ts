import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import fs from 'fs/promises';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 650,
    height: 870,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  // if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
  //   mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  // } else {
  //   mainWindow.loadFile(
  //     path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
  //   );
  // }

  if (app.isPackaged) {
    //打包
    mainWindow.loadFile(path.join(process.resourcesPath, 'web-desktop', 'index.html'));
  } else {
    //调试
    mainWindow.loadFile(path.join(process.cwd(), 'cocosgame', 'web-desktop', 'index.html'));
  }

  //mainWindow.loadFile(path.join(process.cwd(), 'cocosgame', 'web-desktop', 'index.html'));
  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  //隐藏menu
  mainWindow.setMenu(null);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//app.on('ready', createWindow);


app.whenReady().then(() => {
  // 【1】处理单向消息: 例如，接收一个文件路径并读取文件
  ipcMain.on('sendMessage', async (event, content) => {
    console.log(`electron recv:${content}`);
  });
  // 这里可能后续需要优化，避免频繁写入
  //存入数据
  ipcMain.handle("storageSet", async (_, key, value): Promise<boolean> => {
    // const dataDir = path.join(process.cwd(), 'data');
    const dataDir = path.join(app.getPath('userData'), 'data');
    // Windows: %APPDATA%\YourAppName\data
    // macOS: ~/Library/Application Support/YourAppName/data
    // Linux: ~/.config/YourAppName/data
    const exists = await isDirectoryExists(dataDir);
    if (!exists) {
      await fs.mkdir(dataDir);
      console.log('创建目录:', dataDir);
    } else {
      console.log('目录已存在:', dataDir);
    }
    const filepath = path.join(dataDir, key + '.txt');
    await fs.writeFile(filepath, value, 'utf-8');
    return true;
  });
  //读取数据
  ipcMain.handle("storageGet", async (_, key, value): Promise<string | null> => {
    const dataDir = path.join(app.getPath('userData'), 'data');
    const filepath = path.join(dataDir, key + '.txt');
    const fileexists = await isFileExists(filepath);
    if (!fileexists) return null;

    let content: string = await fs.readFile(filepath, 'utf-8');
    return content;
  });
  createWindow();
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


//判断目录是否存在
async function isDirectoryExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}
//判断文件是否存在
async function isFileExists(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}