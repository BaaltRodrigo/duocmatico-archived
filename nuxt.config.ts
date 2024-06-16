import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// https://nuxt.com/docs/api/configuration/nuxt-config
// @see https://vuetifyjs.com/en/getting-started/installation/#using-nuxt-3
export default defineNuxtConfig({
  devtools: { enabled: false },
  css: ["./assets/style/app.scss"],
  ssr: true,
  build: {
    transpile: ["vuetify"],
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    //...
  ],
  nitro: {
    prerender: {
      autoSubfolderIndex: true,
    }
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
});
