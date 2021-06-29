export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "biochain-slide-converter",
    htmlAttrs: {
      lang: "en"
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" }
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]
  },
   server: {
     host: "0.0.0.0"
   },
  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    // {
    //   src: "~/plugins/converter.js",
    //   mode: "server"
    // }
  ],
   serverMiddleware: [
     { path: "/server-middleware", handler: "~/server-middleware/rest.js" },
   ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/tailwindcss
    "@nuxtjs/tailwindcss",
    "@nuxt/postcss8",
    "~/modules/slide-list.js"
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    "@nuxtjs/axios",
    "@nuxtjs/proxy",
    "@nuxtjs/content"
  ],
  proxy: {
    // '/wp-json': 'https://79d801e6b0b6.ngrok.io'
    "/s3": "https://biochain.s3-us-west-1.amazonaws.com/",
  },
  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  //axios: {
  //  baseURL: "http://localhost:3000"
  //},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    babel: {
      plugins: [["@babel/plugin-proposal-private-methods", { loose: true }]]
    }
  }
};
