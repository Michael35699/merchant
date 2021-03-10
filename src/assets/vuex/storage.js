import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {},
    deviceID: "",
    branchID: "0",
    branch: "",
    brand: "",
    url: "https://loyalty.momentgroup.ph",
    appMode: 0,
    supportNumber: "09190845337"
  },

  getters: {
    deviceID: state => state.deviceID,
    branchID: state => state.branchID,
    branch: state => state.branch,
    brand: state => state.brand,
    url: state => state.url,
    appMode: state => state.appMode,
    supportNumber: state => state.supportNumber
  },
  actions: {
    userLogged({ commit }, user) {
      commit("USER_LOGGED", user);
    }
  },

  mutations: {
    USER_LOGGED(state, user) {
      state.user = user;
    }
  }
});