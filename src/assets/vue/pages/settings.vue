<template>
  <f7-page>
    <f7-navbar title="Settings" back-link="/"></f7-navbar>
    <div class="block block-strong">
      <p>
        Contact technical support for the correct entries in the configuration.
      </p>
    </div>
    <div v-if="!isHidden">
      <f7-list form>
        <f7-list-item title="URL">
          <f7-input
            :value="url"
            @input="url = $event.target.value"
            name="url"
            type="url"
            placeholder="url"
        /></f7-list-item>
        <f7-list-item
          title="Branch"
          smart-select
          :smart-select-params="{
            openIn: 'sheet'
          }"
        >
          <select name="branch_name" @change="updateBranch">
            <option
              v-if="!isNaN(parseInt(branchID))"
              :value="branch"
              selected>{{ branch }}</option
            >
            <option
              v-for="{ brand, brand_id, branch } in branches.filter(
                x => x.brand_id !== branchID
              )"
              :key="brand_id"
              :value="branch"
              >{{ branch }}</option
            >
          </select>
        </f7-list-item>
        <f7-list-item title="Support Number">
          <f7-input
            :value="supportNumber"
            @input="supportNumber = $event.target.value"
            name="supportNumber"
            type="number"
            placeholder="number"
          />
        </f7-list-item>
      </f7-list>
      <f7-block
        class="justify-content-center align-items-center text-align-center"
      >
        <f7-row>
          <f7-col></f7-col>
          <f7-col>
            <f7-button raised fill round @click="saveSettings">Save</f7-button>
          </f7-col>
          <f7-col></f7-col>
        </f7-row>
      </f7-block>
    </div>
    <div v-else>
      <f7-list>
        <f7-list-item title="URL">
          <f7-input
            :value="url"
            @input="url = $event.target.value"
            type="url"
            name="url"
            placeholder="url"
          />
        </f7-list-item>
        <f7-block
          class="justify-content-center align-items-center text-align-center"
        >
          <f7-row>
            <f7-col></f7-col>
            <f7-col>
              <f7-button raised fill round @click="verifyURL"
                >Verify URL</f7-button
              >
            </f7-col>
            <f7-col></f7-col>
          </f7-row>
        </f7-block>
      </f7-list>
    </div>
    <div class="block block-strong">
      <p>
        {{ appName }}
        <br />
        {{ versionNo }}
      </p>
    </div>
  </f7-page>
</template>
<script>
import { setTerminalConfig, getTerminalConfig } from "../../js/terminal.js";

export default {
  data: () => ({
    deviceID: "",
    branchID: "",
    brand: "",
    branch: "",
    url: "",
    supportNumber: "",
    versionNo: "",
    appName: "",
    branches: [],
    isHidden: true,
    parseInt,
    isNaN
  }),
  methods: {
    saveSettings() {
      const { getters, state } = this.$store;
      const {
        deviceID,
        branchID,
        brand,
        branch,
        url,
        supportNumber
      } = this.$data;

      console.log("Settings.saveSettings:" + getters.branchID);

      state.deviceID = deviceID;
      state.branchID = branchID;
      state.brand = brand;
      state.branch = branch;
      state.url = url;
      state.supportNumber = supportNumber;

      this.$f7.preloader.show();
      setTerminalConfig();
      this.registerDevice();
    },
    registerDevice() {
      const { url, branchID, brand, branch } = this.$data;
      console.log(`registerDevice: (url) : ${url}`);
      const baseURI = `${url}/moment/php/uploadtmconfig.php?deviceid=${device.uuid}&branchid=${branchID}&brand=${brand}&desc=${branch}`;
      console.log(`registerDevice: (URI) : ${baseURI}`);

      fetch(baseURI)
        .then(res => res.json())
        .then(res => {
          console.log("registerDevice:" + res);
          this.$f7.preloader.hide();
          this.$f7router.back();
          this.$f7router.navigate("/settings/");
        })
        .catch(err => {
          console.log(err);
          this.$f7.dialog.alert(
            "Unable to register device. Please check configuration.",
            "Warning"
          );
        })
        .finally(() => {
          this.$f7.preloader.hide();
        });
    },
    verifyURL() {
      const _dialog = this.$f7.dialog;
      const _data = this.$data;

      const { getters, state } = this.$store;
      const { url } = this.$data;

      // Grab all branches from database
      const URI = `${url}/moment/php/terminalbrandbranchlist.php?deviceid=${device.uuid}`;
      console.log("URI: ", URI);

      fetch(URI)
        .then(res => res.json())
        .then(result => {
          console.log("BRANCHES FETCH: ", result);
          const { errorno, data, message } = result;

          if (parseInt(errorno) === 0) {
            const { branches } = data;

            _data.branches = branches;
            _data.isHidden = false;
          } else {
            _dialog.alert(message, "Warning");
            this.clearFields();
            _data.isHidden = true;
          }
        })
        .catch(error => {
          console.log(error);
          this.$f7.dialog.alert("contact support", "Warning");
        });
    },
    updateBranch() {
      const { branches } = this.$data;

      const name = this.$f7.smartSelect.get(".smart-select").$selectEl.val();

      this.$f7.smartSelect.close();
      const [{ brand, brand_id, branch }] = branches.filter(
        x => x.branch === name
      );

      this.brand = brand;
      this.branch = branch;
      this.branchID = brand_id;
    }
  },
  mounted() {
    const { branchID, branch, brand, url, supportNumber } = this.$store.getters;
    console.log("Settings.mounted:" + branchID);
    this.deviceID = device.uuid;
    this.branchID = branchID;
    this.brand = brand;
    this.branch = branch;
    this.supportNumber = supportNumber;
    this.versionNo = AppVersion.version;
    this.url = url;

    cordova.getAppVersion.getAppName(appName => {
      this.appName = appName;
    });
  }
};
</script>
