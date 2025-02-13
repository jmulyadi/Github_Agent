import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dotenv from "dotenv";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  // Load environment variables from one directory above
  const envPath = path.resolve(__dirname, "../.env");
  const env = dotenv.config({ path: envPath }).parsed || {};

  // Convert env variables into a format Vite understands
  const defineEnv = Object.keys(env).reduce(
    (acc, key) => {
      acc[`import.meta.env.${key}`] = JSON.stringify(env[key]);
      return acc;
    },
    {} as Record<string, string>,
  );

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean,
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: defineEnv, // Inject environment variables properly
  };
});
