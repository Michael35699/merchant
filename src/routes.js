import Home from "./assets/vue/pages/home.vue";
import HomeStoredValue from "./assets/vue/pages/homestoredvalue.vue";
import AboutPage from "./assets/vue/pages/about.vue";
import FormPage from "./assets/vue/pages/form.vue";
import LoyaltyPurchase from "./assets/vue/pages/loyaltypurchase.vue";
import LoyaltyRenew from "./assets/vue/pages/loyaltyrenewal.vue";
import LoyaltyVerify from "./assets/vue/pages/loyaltyverify.vue";
import LoyaltyVerifyCoupon from "./assets/vue/pages/loyaltyverifycoupon.vue";
import LoyaltyRedemption from "./assets/vue/pages/loyaltyredemption.vue";
import LoyaltyReplacement from "./assets/vue/pages/loyaltyreplacement.vue";
import DynamicRoutePage from "./assets/vue/pages/dynamic-route.vue";
import SettingsPage from "./assets/vue/pages/settings.vue";

import PanelLeftPage from "./assets/vue/pages/panel-left.vue";
import ColorThemes from "./assets/vue/pages/color-themes.vue";
import Chat from "./assets/vue/pages/chat.vue";
import Vuex from "./assets/vue/pages/vuex.vue";

export default [
  {
    path: "/",
    component: Home,
    routes: [
      {
        name: "purchase",
        path: "purchase/",
        component: LoyaltyPurchase
      },
      {
        name: "renew",
        path: "renew/",
        component: LoyaltyRenew
      },
      {
        name: "verify",
        path: "verify/",
        component: LoyaltyVerify
      },
      {
        name: "verifycoupon",
        path: "verifycoupon/",
        component: LoyaltyVerifyCoupon
      },
      {
        name: "redemption",
        path: "redemption/",
        component: LoyaltyRedemption
      },
      {
        name: "replacement",
        path: "replacement/",
        component: LoyaltyReplacement
      }
    ]
  },
  {
    path: "/StoredValue/",
    component: HomeStoredValue,
    routes: [
      {
        name: "form",
        path: "form/",
        component: FormPage
      },
      {
        path: "about/",
        component: AboutPage
      },

      {
        path: "dynamic-route/blog/:blogId/post/:postId/",
        component: DynamicRoutePage
      },

      {
        path: "color-themes/",
        component: ColorThemes
      },
      {
        path: "chat/",
        component: Chat
      },
      {
        path: "vuex/",
        component: Vuex
      }
    ]
  },
  {
    path: "/settings/",
    component: SettingsPage
  },
  {
    path: "/panel-left/",
    component: PanelLeftPage
  }
];
