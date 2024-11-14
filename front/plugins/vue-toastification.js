import VueToastification from 'vue-toastification';
import 'vue-toastification/dist/index.css'; // Importer les styles de Toastification

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(VueToastification, {
        // Configurer les options par défaut, si nécessaire
        position: 'bottom-right',
        timeout: 5000,  // Durée d'affichage du toast (en ms)
        closeOnClick: true,  // Fermer au clic
    });
});
