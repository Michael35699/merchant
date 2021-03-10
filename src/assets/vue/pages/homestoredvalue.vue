<template>
  <f7-page>
    <f7-navbar>
      <f7-nav-left>
        <f7-link
          class="panel-open"
          open-panel="left"
          icon="fas fa-bars"
        ></f7-link>
      </f7-nav-left>
      <div class="title">Stored Value</div>
      <f7-nav-right>
        <f7-link
          class="searchbar-enable"
          data-searchbar=".searchbar-components"
          icon="fas fa-search"
        ></f7-link>
      </f7-nav-right>
      <f7-searchbar
        class="searchbar-components"
        search-container=".components-list"
        search-in="a"
        expandable
      ></f7-searchbar>
    </f7-navbar>
    <f7-block-title>Features</f7-block-title>
    <f7-block inner>
      <p>Merchant functions to process cardholder needs.</p>
    </f7-block>
    <f7-block-title class="searchbar-found">Cards</f7-block-title>
    <f7-list class="components-list searchbar-found">
      <f7-list-item link="/StoredValue/about/" title="Pay" panel-close>
        <f7-icon slot="media" f7="creditcard_fill"></f7-icon>
      </f7-list-item>
      <f7-list-item
        link="/StoredValue/about/"
        title="Balance Inquiry"
        panel-close
      >
        <f7-icon slot="media" f7="creditcard_fill"></f7-icon>
      </f7-list-item>
      <f7-list-item link="/StoredValue/about/" title="Top Up" panel-close>
        <f7-icon slot="media" f7="goforward"></f7-icon>
      </f7-list-item>
    </f7-list>
    <f7-list class="searchbar-not-found">
      <f7-list-item title="Nothing found"></f7-list-item>
    </f7-list>
    <f7-block-title class="searchbar-hide-on-search">Help</f7-block-title>
    <f7-list class="searchbar-hide-on-search">
      <f7-list-item
        v-on:click="callSupport"
        title="Call Technical Support"
        panel-close
      >
        <f7-icon slot="media" f7="phone_arrow_down_left"></f7-icon>
        <!-- icon="fas phone_fill_arrow_up_right fa-fw" -->
      </f7-list-item>
    </f7-list>
  </f7-page>
</template>
<script>
import { getTerminalConfig } from "../../js/terminal.js";

export default {
  components: {},
  data: () => ({ appMode: 1 }),
  methods: {
    callSupport() {
      const { onSuccess: success, onError: error, $store: store } = this;
      const { supportNumber: support } = store.getters;

      const { callNumber } = window.plugins.CallNumber;

      callNumber(success, error, support, true);
    },
    onSuccess(result) {
      console.log(`Success: ${result}`);
    },
    onError(result) {
      console.log(`Error: ${result}`);
    }
  },
  mounted() {
    const { appMode } = this.$data;
    this.$store.state.appMode = appMode;
    console.log("homesv.mounted: data=" + appMode);
  }
};
</script>
