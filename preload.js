const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  createUser: (data) => ipcRenderer.invoke("create-user", data),
});
