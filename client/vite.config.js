import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  build: {
    rolldownOptions: {
      output: {
        // React and the router get their own file: it changes only when we
        // upgrade them, so after a deploy returning visitors re-download just
        // our own code (about 58 kB) instead of everything. Splitting Radix or
        // the icons too made the first load bigger (they pulled in code only
        // other pages use), so only React is split. Pages stay their own lazy
        // files (src/pageLoaders.js).
        codeSplitting: {
          groups: [
            {
              name: "vendor-react",
              test: /node_modules[\/](react|react-dom|react-router|react-router-dom|scheduler)[\/]/,
              priority: 30,
            },
          ],
        },
      },
    },
  },
});
