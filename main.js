const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

let mainWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "images", "LOGO.png"), // optional app icon
    webPreferences: {
      nodeIntegration: true, // enable Node.js in renderer (for HTML pages)
      contextIsolation: false,
    },
  });

  // Remove default menu bar (File, Edit, View, etc.)
  Menu.setApplicationMenu(null);

  // Connect to MongoDB Atlas
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ Failed to connect MongoDB:", err.message);
  }

  // Load the dashboard (inside src folder)
  mainWindow.loadFile(path.join(__dirname, "src", "index.html"));

  // Uncomment for debugging
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
