```
npx create-electron-app@latest TheStoryofPottedPlants-electron-vite-ts --template=vite-typescript
```
- 将 Cocos 构建生成的整个 web-desktop 文件夹 复制到项目的cocosgame目录下
- 修改main.ts加载index.html
```
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
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
};

```
- 修改forge.config.ts 打包时 把cocosgame目录打包进去
```
  packagerConfig: {
    asar: true,

    extraResource: ['./cocosgame/web-desktop'], // 将游戏资源复制到打包目录

  },
```
- 执行npm start 运行起来则成功
- 解决网络问题：创建 .npmrc 文件 (淘宝镜像)
```
registry=https://registry.npmmirror.com
electron_mirror=https://npmmirror.com/mirrors/electron/
```

- 打包 
```
npm run make
```