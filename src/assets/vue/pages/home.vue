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
      <div class="title">Moment card</div>
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
    <f7-block-title class="searchbar-found">Moments</f7-block-title>
    <f7-list class="components-list searchbar-found">
      <f7-list-item link="/purchase/" title="Purchase" panel-close>
        <f7-icon slot="media" f7="creditcard_fill"></f7-icon>
        <!-- icon="fas fa-id-card-alt fa-fw" -->
      </f7-list-item>
      <f7-list-item link="/renew/" title="Renewal" panel-close>
        <f7-icon slot="media" f7="goforward"></f7-icon>
        <!-- icon="fas fa-rss fa-fw" -->
      </f7-list-item>
      <f7-list-item link="/verify/" title="Verification" panel-close>
        <f7-icon slot="media" f7="doc_checkmark_fill"></f7-icon>
        <!-- icon="fas fa-user fa-fw" -->
      </f7-list-item>
      <f7-list-item link="/replacement/" title="Replacement" panel-close>
        <f7-icon slot="media" f7="rectangle_stack_person_crop_fill"></f7-icon>
        <!-- icon="fas fa-battery-empty fa-fw" -->
      </f7-list-item>
      <f7-list-item
        external
        link="https://momentcard.ph"
        title="Registration"
        panel-close
      >
        <f7-icon slot="media" f7="doc_text_fill"></f7-icon>
        <!-- icon="fas fa-battery-empty fa-fw" -->
      </f7-list-item>
      <f7-list-item
        external
        link="https://loyalty.momentgroup.ph/cardholder"
        title="Email and Password Reset"
        panel-close
      >
        <f7-icon slot="media" f7="lock_shield_fill"></f7-icon>
        <!-- icon="fas fa-battery-empty fa-fw" -->
      </f7-list-item>
    </f7-list>

    <f7-block-title class="searchbar-found">Rewards</f7-block-title>
    <f7-list class="components-list searchbar-found">
      <f7-list-item link="/redeemitems/" title="Redeem Items" panel-close>
        <f7-icon slot="media" f7="gift_fill"></f7-icon>
      </f7-list-item>
      <f7-list-item link="/redeemcoupon/" title="Redeem Coupon" panel-close>
        <f7-icon slot="media" f7="gift_fill"></f7-icon>
      </f7-list-item>
      <f7-list-item link="/verifycoupon/" title="Verify Coupon" panel-close>
        <f7-icon slot="media" f7="checkmark_rectangle_fill"></f7-icon>
      </f7-list-item>
    </f7-list>

    <f7-list class="searchbar-not-found">
      <f7-list-item title="Nothing found"></f7-list-item>
    </f7-list>
    <f7-block-title class="searchbar-hide-on-search">Help</f7-block-title>
    <f7-list class="searchbar-hide-on-search">
      <!--f7-list-item title="Dashboard" external link="./index.html?theme=ios"></f7-list-item>
      <f7-list-item title="Reedem" external link="./index.html?theme=md"></f7-list-item>
      <f7-list-item title="How it works" external link="https://momentcard.ph"></f7-list-item!-->
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
import "framework7-icons";
// import { CallNumber } from "cordova-plugin-os-call-number";

export default {
  components: {},
  data: () => ({ appMode: 0 }),
  methods: {
    callSupport() {
      const { onSuccess: success, onError: error, $store: store } = this;
      const { supportNumber: support } = store.getters;

      plugins.CallNumber.callNumber(success, error, support, true);
    },
    onSuccess(res) {
      console.log(`Success: ${res}`);
    },
    onError(res) {
      console.log(`Error: ${res}`);
    }
  },
  mounted() {
    const { appMode } = this.$data;
    this.$store.state.appMode = appMode;
    console.log(`home.mounted: data=${appMode}`);
    getTerminalConfig(this);

    const defExit = e => {
      e.preventDefault();

      if (this.$f7router.history.length < 2) {
        navigator.app.exitApp();
      } else {
        this.$f7router.back();
      }
    };
    const defBack = e => {
      e.preventDefault();
      if (this.$f7router.history.length < 2) {
        document.removeEventListener("backbutton", defBack);
        document.addEventListener("backbutton", defExit);

        window.plugins.toast.showWithOptions({
          message: "Press again to exit.",
          duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
          position: "bottom",
          addPixelsY: -40 // added a negative value to move it up a bit (default 0)
        });

        setTimeout(() => {
          document.removeEventListener("backbutton", defExit);
          document.addEventListener("backbutton", defBack);
        }, 1000);
      } else {
        this.$f7router.back();
      }
    };

    document.addEventListener("backbutton", defBack);
  }
};
</script>
