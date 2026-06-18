import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { sharetribeMiddleware } from "./server/sharetribe";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Expose non-VITE_ env vars to server middleware
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "sharetribe-api",
        configureServer(server) {
          server.middlewares.use(sharetribeMiddleware());
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
