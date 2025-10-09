import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import { fileURLToPath } from "url";
import vueJsx from '@vitejs/plugin-vue-jsx'
// import { fileURLToPath, resolve, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // resolve: { alias: { "@": resolve(__dirname, "src") } },
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      imports: ["vue", "vue-router", "pinia"],
      // auto-import everything exported from files in src/hooks
      dirs: [
        "src/hooks",
        // optionally subfolders
        "src/hooks/**",
      ],
      dts: "src/auto-imports.d.ts",
      // eslint globals (optional)
      eslintrc: {
        enabled: false,
        filepath: "./.eslintrc-auto-import.json",
        globalsPropValue: true,
      },
    }),
    // Auto register components (Ant Design Vue + local components)
    Components({
      // resolve Ant Design Vue components automatically
      resolvers: [
        // disable resolver style auto import by setting importStyle to false
        AntDesignVueResolver({ importStyle: false, resolveIcons: true }),
      ],
      // scan local components folder(s)
      dirs: ["src/components", "src/layouts"],
      // allow auto import of icons if using @ant-design/icons-vue
      extensions: ["vue"],
      // generate components.d.ts for IDE
      dts: "src/components.d.ts",
      // deep search in dirs
      deep: true,
      // Allow subdirectories as namespace prefix for components.
      directoryAsNamespace: false,
      // Subdirectory paths for ignoring namespace prefixes
      // works when `directoryAsNamespace: true`
      globalNamespaces: [],

      // auto import for directives
      // default: `true` for Vue 3, `false` for Vue 2
      // Babel is needed to do the transformation for Vue 2, it's disabled by default for performance concerns.
      // To install Babel, run: `npm install -D @babel/parser @babel/traverse`
      directives: true,

      // filters for transforming targets
      include: [/\.vue$/, /\.vue\?vue/],
      exclude: [
        /[\\/]node_modules[\\/]/,
        /[\\/]\.git[\\/]/,
        /[\\/]\.nuxt[\\/]/,
      ],
    }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          "primary-color": "#1890ff",
          "border-radius-base": "6px",
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    rolldownOptions: {
      external: ["react", "react/jsx-runtime"],
    },
  },
});
