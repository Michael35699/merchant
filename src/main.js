// Import Vue
import Vue from "vue";

// Import Framework7
import Framework7 from "framework7/framework7.esm.bundle";

// Import F7 Vue Plugin
import Framework7Vue from "framework7-vue/framework7-vue.esm.bundle.js";

// Import F7 Style
import Framework7CSS from "framework7/css/framework7.bundle.min.css";

// Import F7 iOS Icons
import Framework7Icons from "framework7-icons/css/framework7-icons.css";

// Import Material Icons
import MaterialIcons from "material-design-icons/iconfont/material-icons.css";

// Import Fontawesome Theme Styles
import FontAwesome from "@fortawesome/fontawesome-free/css/all.min.css";

// Import fastClick
import FastClick from "fastclick";
import axios from "axios";

Vue.use(axios);

// Import App Custom Styles
// import AppStyles from './assets/sass/main.scss'

// Import App Component
import app from "./main.vue";
import routes from "./routes.js";

// Import Vuex Storage
import store from "./assets/vuex/storage.js";
import { initTerminalDatabase } from "./assets/js/terminal";
import RangeComponent from "framework7/components/range/range";

// Different F7-Vue plugin initialization with f7 v3.0
Framework7.use(Framework7Vue);
// Init Vue App
export default new Vue({
  // Root Element
  el: "#app",
  store,
  render: c => c("app"),
  components: {
    app
  },
  mounted() {
    window.addEventListener("load", () => {
      // run after everything is in-place
      FastClick.attach(document.body);
    });
  }
});

document.addEventListener(
  "deviceready",
  function() {
    // initialize database
    initTerminalDatabase();
  },
  true
);

//REFERENCE CODE FOR BACK TO EXIT
// function onBackKeyDown(e) {
//   e.preventDefault();
//   e.stopPropagation();
//   if (new Date().getTime() - lastTimeBackPress < timePeriodToExit) {
//     navigator.app.exitApp();
//   } else {
//     window.plugins.toast.showWithOptions({
//       message: "Press again to exit.",
//       duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
//       position: "bottom",
//       addPixelsY: -40 // added a negative value to move it up a bit (default 0)
//     });

//     lastTimeBackPress = new Date().getTime();
//     navigator.app.backHistory();
//   }
// }

// document.addEventListener("backbutton", onBackKeyDown, false);
