const { app, BrowserWindow, shell } = require("electron");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const host = "127.0.0.1";
let staticServer;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp"
};

function getRendererRoot() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "web");
  }

  return path.resolve(__dirname, "../asystent-remontu-web/dist/public");
}

function getWindowIcon() {
  return path.resolve(__dirname, "assets/images/icon.png");
}

function resolveRequestPath(rootDir, requestUrl) {
  const url = new URL(requestUrl, `http://${host}`);
  const pathname = decodeURIComponent(url.pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
  const candidatePath = path.normalize(path.join(rootDir, relativePath));

  if (!candidatePath.startsWith(path.normalize(rootDir))) {
    return null;
  }

  if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
    return candidatePath;
  }

  return path.join(rootDir, "index.html");
}

function createStaticServer(rootDir) {
  return http.createServer((request, response) => {
    const filePath = resolveRequestPath(rootDir, request.url || "/");

    if (!filePath || !fs.existsSync(filePath)) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extension] || "application/octet-stream";

    response.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(response);
  });
}

async function startStaticServer(rootDir) {
  if (!fs.existsSync(rootDir)) {
    throw new Error(`Renderer build not found: ${rootDir}`);
  }

  staticServer = createStaticServer(rootDir);

  await new Promise((resolve, reject) => {
    staticServer.once("error", reject);
    staticServer.listen(0, host, resolve);
  });

  const address = staticServer.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not determine local server address");
  }

  return `http://${host}:${address.port}/`;
}

async function createMainWindow() {
  const startUrl = await startStaticServer(getRendererRoot());

  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 760,
    backgroundColor: "#f6f3ee",
    autoHideMenuBar: true,
    show: false,
    icon: getWindowIcon(),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  window.webContents.on("will-navigate", (event, url) => {
    const allowedPrefix = startUrl;
    if (!url.startsWith(allowedPrefix)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  window.once("ready-to-show", () => {
    window.show();
  });

  await window.loadURL(startUrl);
}

app.whenReady().then(createMainWindow).catch((error) => {
  console.error(error);
  app.quit();
});

app.on("window-all-closed", () => {
  if (staticServer) {
    staticServer.close();
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow().catch((error) => {
      console.error(error);
      app.quit();
    });
  }
});