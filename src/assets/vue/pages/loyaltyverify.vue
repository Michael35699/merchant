<template>
  <f7-page>
    <f7-navbar
      title="Verify moment card"
      back-link="this.$f7router.navigate('/r')"
    ></f7-navbar>
    <p>
      Verify the Item QR code and that there are enough points before redeeming.
    </p>

    <div
      class="content-block justify-content-center align-items-center text-align-center"
      v-on:click="scanCard"
    >
      <f7-icon f7="qrcode_viewfinder" size="40px"></f7-icon>
      <p>Scan Card</p>
    </div>

    <div toHide v-if="scanned">
      <f7-block-title>Cardholder Details</f7-block-title>
      <f7-list>
        <f7-list-item header="Card Number" v-bind:title="cardNumber">
          <f7-icon slot="media" f7="creditcard_fill"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Card Status" v-bind:title="cardStatus">
          <f7-icon slot="media" f7="rectangle_fill_badge_checkmark"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Membership Tier" v-bind:title="memberLevel">
          <f7-icon slot="media" f7="doc_person_fill"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Name" v-bind:title="name">
          <f7-icon slot="media" f7="doc_text_fill"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Birth Date" v-bind:title="birthDate">
          <f7-icon slot="media" f7="table_fill"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Card Expiry" v-bind:title="cardExpiry">
          <f7-icon slot="media" f7="rectangle_fill_badge_xmark"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Purchase To Date" v-bind:title="purchaseToDate">
          <f7-icon slot="media" f7="calendar"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Earned Moments" v-bind:title="totalPoints">
          <f7-icon slot="media" f7="square_stack_3d_up_fill"></f7-icon>
        </f7-list-item>
        <f7-list-item
          header="Active Moments (may include additional free Moments)"
          v-bind:title="pointsAvailable"
        >
          <f7-icon slot="media" f7="gift_alt_fill"></f7-icon>
        </f7-list-item>
      </f7-list>
    </div>
  </f7-page>
</template>
<script>
export default {
  components: {},
  data: () => ({
    cardNumber: "",
    cardStatus: "",
    memberLevel: "",
    name: "",
    birthDate: "",
    cardExpiry: "",
    purchaseToDate: "",
    totalPoints: "",
    pointsAvailable: "",
    scanned: false
  }),
  methods: {
    scanCard() {
      this.clearFields();
      const options = {
        preferFrontCamera: false, // iOS and Android
        showFlipCameraButton: true, // iOS and Android
        showTorchButton: true, // iOS and Android
        torchOn: false, // Android, launch with the torch switched on (if available)
        saveHistory: false, // Android, save scan history (default false)
        prompt: "Place a QRCODE inside the scan area", // Android
        resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
        formats: "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
        orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
        disableAnimations: true, // iOS
        disableSuccessBeep: false // iOS and Android
      };

      const { barcodeSuccess: success, barcodeError: error } = this;

      cordova.plugins.barcodeScanner.scan(success, error, options);
    },
    barcodeSuccess(result) {
      console.log(result.text);
      this.$data.orFileName = "";
      if (result.text != "") {
        this.verifyCard(result.text);
      }
    },
    barcodeError() {
      this.$data.orFileName = "";
      alert("Scanning failed: " + error);
    },
    clearFields() {
      this.cardNumber = "";
      this.cardStatus = "";
      this.memberLevel = "";
      this.name = "";
      this.cardExpiry = "";
      this.purchaseToDate = "";
      this.totalPoints = "";
      this.pointsAvailable = "";
      this.birthDate = "";

      this.scanned = false;
    },
    verifyCard(cardNumber) {
      this.$f7.dialog.preloader("Verifying card for purchase");

      const { url } = this.$store.getters;

      const baseURI = `${url}/moment/php/cardverify.php?param=${cardNumber}&type=0`;
      console.log("purchaseCard: (URI) : " + baseURI);

      fetch(baseURI)
        .then(result => result.json())
        .then(result => {
          const { errorno, data, message } = result; // result.data to result;

          if (parseInt(errorno) == 0) {
            const [DATA] = data;
            console.log(DATA);

            const { CardStatusDesc, FirstName, PurchaseToDate } = DATA;
            const { MemberLevel, CardExpiry, CardStatus, BirthDate } = DATA;
            const { LastName, TotalPointsAwarded, PointsAvailable } = DATA;
            console.log(`verifyCard (Status): ${CardStatus}`);

            this.cardNumber = cardNumber;
            this.cardStatus = CardStatusDesc;
            this.memberLevel = MemberLevel;
            this.name = `${FirstName} ${LastName}`;
            this.birthDate = BirthDate;
            this.cardExpiry = CardExpiry;
            this.purchaseToDate = PurchaseToDate;
            this.totalPoints = TotalPointsAwarded;
            this.pointsAvailable = PointsAvailable;

            this.scanned = true;
          } else {
            this.$f7.dialog.alert(message, "Warning");
            this.clearFields();
          }
        })
        .catch(error => {
          console.log(error);
          this.$f7.dialog.alert(
            "Unable to perform card purchase. Please contact support",
            "Warning"
          );
        })
        .finally(() => {
          this.$f7.dialog.close();
        });
    }
  }
};
</script>
