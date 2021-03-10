<template>
  <f7-page>
    <f7-navbar
      title="Rewards Redemption"
      back-link="this.$f7router.navigate('/r')"
    ></f7-navbar>
    <p>
      Scan coupon's QR code to retrieve redemption details and proceed with the
      transaction.
    </p>

    <div
      class="content-block justify-content-center align-items-center text-align-center"
      v-on:click="scanCoupon"
    >
      <f7-icon f7="qrcode_viewfinder" size="40px"></f7-icon>
      <p>Scan Coupon</p>
    </div>

    <div toHide v-if="scanned">
      <f7-block-title>Item Details</f7-block-title>
      <f7-list>
        <f7-list-item header="Item" :title="itemForRedemption">
          <f7-icon slot="media" f7="cart_fill"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Active Moments Required" :title="pointsRequired">
          <f7-icon slot="media" f7="cart_fill_badge_plus"></f7-icon>
        </f7-list-item>
      </f7-list>
      <f7-block-title>Cardholder Details</f7-block-title>
      <f7-list>
        <f7-list-item header="Name" :title="name">
          <f7-icon slot="media" f7="person_crop_rectangle_fill"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Card Number" :title="cardNumber">
          <f7-icon slot="media" f7="creditcard_fill"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Card Expiry" :title="cardExpiry">
          <f7-icon slot="media" f7="rectangle_fill_badge_xmark"></f7-icon>
        </f7-list-item>
        <f7-list-item
          header="Active Moments (may include additional free Moments)"
          :title="pointsAvailable"
        >
          <f7-icon slot="media" f7="gift_alt_fill"></f7-icon>
        </f7-list-item>
      </f7-list>

      <f7-block
        class="justify-content-center align-items-center text-align-center"
      >
        <f7-row>
          <f7-col></f7-col>
          <f7-col>
            <f7-button raised fill round v-on:click="processRedemption"
              >Redeem Item</f7-button
            >
          </f7-col>
          <f7-col></f7-col>
        </f7-row>
      </f7-block>
    </div>
  </f7-page>
</template>
<script>
export default {
  components: {},
  data: () => ({
    voucher: "",
    itemForRedemption: "",
    pointsRequired: "",
    cardNumber: "",
    name: "",
    cardExpiry: "",
    pointsAvailable: "",
    scanned: false
  }),
  methods: {
    scanCoupon() {
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
      this.clearFields();
      if (result.text !== "") {
        this.$data.voucher = result.text;
        this.verifyCoupon(result.text);
      }
    },
    barcodeError() {
      this.$data.orFileName = "";
      alert("Scanning failed: " + error);
    },
    clearFields() {
      this.voucher = "";
      this.itemForRedemption = "";
      this.pointsRequired = "";
      this.name = "";
      this.cardNumber = "";
      this.cardExpiry = "";
      this.pointsAvailable = "";
      this.scanned = false;
    },
    processRedemption() {
      const { brand, branch, url } = this.$store.getters;

      this.$f7.dialog.preloader("Processing item for redemption");
      const verRdParam = { brand: "", voucher: "", deviceID: "" };
      verRdParam.brand = brand;
      verRdParam.branch = branch;
      verRdParam.voucher = this.$data.voucher;
      verRdParam.deviceID = device.uuid;

      const baseURI = `${url}/moment/php/terminalredemption.php?param=${JSON.stringify(
        verRdParam
      )}`;
      console.log(`verifyCoupon: (URI) : ${baseURI}`);

      fetch(baseURI)
        .then(result => result.json())
        .then(result => {
          const { message, errorno } = result;
          console.log(result);
          console.log("verifyCoupon (Error No):" + errorno);
          if (parseInt(errorno) === 0) {
            this.$f7.dialog.alert(message, "Congratulations");
          } else {
            this.$f7.dialog.alert(message, "Warning");
          }
          this.clearFields();
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
    },
    verifyCoupon(coupon) {
      const { brand, url } = this.$store.getters;
      this.$f7.dialog.preloader("Verifying coupon");
      const verRdParam = { brand, voucher: coupon, deviceID: device.uuid };

      const param = JSON.stringify(verRdParam);
      const baseURI = `${url}/moment/php/terminalverifyredemptionv2.php?param=${param}`;
      console.log(`verifyCoupon: (URI) : ${baseURI}`);

      fetch(baseURI)
        .then(result => result.json())
        .then(result => {
          const _data = this.$data;

          const { errorno, message, data } = result;

          console.log("verifyCoupon (Error No):" + errorno);
          if (parseInt(errorno) === 0) {
            const [DATA] = data;
            const { Item, PointsRedeemed, Name } = DATA;
            const { MemberCardNumber, CardExpiry, PointsAvailable } = DATA;

            _data.itemForRedemption = Item;
            _data.pointsRequired = PointsRedeemed;
            _data.name = Name;
            _data.cardNumber = MemberCardNumber;
            _data.cardExpiry = CardExpiry;
            _data.pointsAvailable = PointsAvailable;

            _data.scanned = true;
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
