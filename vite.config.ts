import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  appType: "spa",
  server: {
    middlewareMode: false
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          icons: ["@radix-ui/react-icons", "react-icons", "lucide-react"],
          chartjs: ["react-chartjs-2", "chart.js"],
          radix: [
            "@radix-ui/react-accordion",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-context-menu",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-hover-card",
            "@radix-ui/react-label",
            "@radix-ui/react-menubar",
            "@radix-ui/react-navigation-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "cmdk"
          ],
          table: ["@tanstack/react-table"],
          virtuoso: ["react-virtuoso"],
          dnd: ["@hello-pangea/dnd"],
          date: ["react-day-picker", "date-fns"],
          pako: ["pako"]
        }
      }
    }
  }
})
