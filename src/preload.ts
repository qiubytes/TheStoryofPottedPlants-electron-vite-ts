// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
// src/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    // 单向发送，用于触发主进程任务，无需等待结果
    sendMessage: (content: string) => {
        ipcRenderer.send('sendMessage', content);
    },
    //存储数据 主进程调用Node本地存储
    storageSet: async (key: string, value: string | null): Promise<boolean> => {
        return await ipcRenderer.invoke("storageSet", key, value);
    },
    storageGet: async (key: string): Promise<string | null> => {
        return await ipcRenderer.invoke("storageGet", key);
    },
});