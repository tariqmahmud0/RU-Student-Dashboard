import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const RU_API_BASE = "https://eresult.ru.ac.bd:9603/api";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy endpoint for RU API to handle browser CORS or network sandbox issues smoothly
  app.all("/api/proxy/*", async (req, res) => {
    try {
      // Extract sub-path following /api/proxy/
      const endpointPath = req.params[0] || "";
      const targetUrl = `${RU_API_BASE}/${endpointPath}`;

      const headers: Record<string, string> = {
        "Accept": "application/json",
        "Content-Type": "application/json",
      };

      if (req.headers.authorization) {
        headers["Authorization"] = req.headers.authorization;
      }

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
      };

      if (req.method !== "GET" && req.method !== "HEAD" && req.body && Object.keys(req.body).length > 0) {
        fetchOptions.body = JSON.stringify(req.body);
      }

      const response = await fetch(targetUrl, fetchOptions);
      const data = await response.json().catch(() => null);

      res.status(response.status).json(data || { status: false, message: "Invalid JSON response from server" });
    } catch (error: any) {
      res.status(502).json({
        status: false,
        message: "Failed to communicate with RU e-result server",
        error: error.message,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RU Student Dashboard server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
