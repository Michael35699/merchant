<template>
  <!-- App -->
  <f7-app
    :params="f7params"
    v-bind:class="{ 'theme-dark': true, 'color-theme-red': true }"
  >
    <!-- DARK THEME -->
    <f7-statusbar></f7-statusbar>
    <f7-panel left cover>
      <f7-view url="/panel-left/" links-view=".view-main" />
    </f7-panel>
    <f7-view url="/" :main="true" class="ios-edges"></f7-view>
  </f7-app>
</template>
<script>
// Import Routes...
import { f7App, f7Panel, f7View, f7Statusbar } from "framework7-vue";
import routes from "./routes.js";

let theme = "auto";
if (document.location.search.indexOf("theme=") >= 0) {
  theme = document.location.search.split("theme=")[1].split("&")[0];
}

export default {
  components: {
    "f7-app": f7App,
    "f7-panel": f7Panel,
    "f7-view": f7View,
    "f7-statusbar": f7Statusbar
  },
  data: () => ({
    f7params: {
      theme,
      routes,
      id: "io.framework7.testapp",
      pushState: true,
      statusbar: {
        enabled: true,
        androidTextColor: "white"
      }
    }
  })
};
</script>
