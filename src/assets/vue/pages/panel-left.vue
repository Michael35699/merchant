<template>
  <f7-page>
    <f7-block-title>Rewards System</f7-block-title>

    <f7-block-title>Options</f7-block-title>
    <f7-list>
      <f7-list-item
        link="/StoredValue/"
        data-view=".view-main"
        title="Stored Value"
        panel-close
        v-if="this.$store.getters.appMode == 0"
        :reload-current="true"
      ></f7-list-item>
      <f7-list-item
        v-else
        link="/"
        title="Moment card"
        data-view=".view-main"
        :reload-current="true"
        panel-close
      ></f7-list-item>
      <f7-list-item
        link="/settings/"
        title="Settings"
        panel-close
      ></f7-list-item>
    </f7-list>
  </f7-page>
</template>
<script>
export default {
  components: {},
  data: () => ({
    appMode: null
  }),
  mounted() {
    this.$data.appMode = this.$store.state.appMode;
    console.log(`leftpanel.beforeMount: data=${this.$data.appMode}`);
  }
};
</script>
