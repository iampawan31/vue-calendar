import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import VueTextareaAutosize from "vue-textarea-autosize";
import firebase from "firebase/app";
import "firebase/firestore";

Vue.use(VueTextareaAutosize);

Vue.config.productionTip = false;

firebase.initializeApp({
  apiKey: "AIzaSyDbOlNK4nhsU0gsTQod1I1y-CtZ7CqrEQk",
  authDomain: "vue-calendar-6f683.firebaseapp.com",
  databaseURL: "https://vue-calendar-6f683.firebaseio.com",
  projectId: "vue-calendar-6f683",
  storageBucket: "vue-calendar-6f683.appspot.com",
  messagingSenderId: "52577755518",
  appId: "1:52577755518:web:a6dfc8de4a553b073c532f",
});

export const db = firebase.firestore();

new Vue({
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
