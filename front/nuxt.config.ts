export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt"],

  shadcn: {
    prefix: "",
    componentDir: "./components/ui",
  },

  compatibilityDate: "2024-07-16",

  // Configuration du build
  build: {
    // Nuxt 3 gère automatiquement les optimisations de build
  },

  // Configuration pour la génération statique
  generate: {
    // Plus besoin de spécifier `fallback`, Nuxt gère automatiquement la page 404
  },

  // Configuration de l'application
  app: {
    baseURL: "/", // Définir la base de votre URL si nécessaire
  },
});