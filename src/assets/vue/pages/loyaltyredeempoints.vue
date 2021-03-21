<template>
  <f7-page>
    <f7-navbar title="Point Redemption" back-link="this.$f7router.navigate('/r')"></f7-navbar>
    <div v-if="scanned">
      <f7-block-title>Convert Moments</f7-block-title>
      <div class="center-flex flex-direction-column">
        <div class="title-number">₱ {{ (redeemValue / conversionRate).addCommas() }}</div>
        <div class="desc-subtitle">You have {{ pointsAvailable.addCommas() }} moments.</div>
        <div class="desc-subtitle">This will take {{ redeemValue.addCommas() }} moments.</div>
      </div>

      <f7-block-title>Cardholder Details</f7-block-title>
      <f7-list>
        <f7-list-item header="Name" :title="name">
          <f7-icon slot="media" f7="person_crop_rectangle_fill"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Membership Tier" :title="memberLevel">
          <f7-icon slot="media" f7="creditcard_fill"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Card Number" :title="cardNumber">
          <f7-icon slot="media" f7="creditcard_fill"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Card Expiry" :title="cardExpiry">
          <f7-icon slot="media" f7="rectangle_fill_badge_xmark"></f7-icon>
        </f7-list-item>
        <f7-list-item
          header="Active Moments (may include additional free Moments)"
          :title="pointsAvailable.addCommas()"
        >
          <f7-icon slot="media" f7="gift_alt_fill"></f7-icon>
        </f7-list-item>
      </f7-list>

      <div class="button-bar">
        <f7-row class="inner-button-bar">
          <f7-col>
            <f7-button
              noclip
              outline
              icon-f7="minus"
              @click="decrement"
              :disabled="redeemValue <= minValue"
            ></f7-button>
          </f7-col>
          <f7-col class="increment-number">500</f7-col>
          <f7-col>
            <f7-button
              noclip
              outline
              icon-f7="plus"
              @click="increment"
              :disabled="cannotIncrease()"
            ></f7-button>
          </f7-col>
        </f7-row>
      </div>

      <f7-block-title class="justify-content-center align-items-center text-align-center">
        <f7-row>
          <f7-col></f7-col>
          <f7-col>
            <f7-button raised fill round @click="processRedemption">Redeem</f7-button>
          </f7-col>
          <f7-col></f7-col>
        </f7-row>
      </f7-block-title>
    </div>
    <!-- <div v-else class="whole-body center-flex flex-direction-column"> -->
    <div v-else class="whole-body">
      <p class="description-text">
        Scan coupon's QR code to retrieve redemption details and proceed with the
        transaction.
      </p>
      <div class="scan-button">
        <div
          class="content-block justify-content-center align-items-center text-align-center"
          @click="scanCard"
        >
          <f7-icon f7="qrcode_viewfinder" size="40px"></f7-icon>
          <p>Scan Card</p>
        </div>
      </div>
    </div>
  </f7-page>
</template>

<script>
export default {
  components: {},
  data: () => ({
    // NOTE: Default values for initialization, do not change
    name: "",
    cardExpiry: "",
    cardNumber: "",
    memberLevel: "",
    pointsAvailable: 0,

    // FIXME: These should be replaced before production
    scanned: false,
    eligible: false,

    // NOTE: Mutable state
    redeemValue: 0,

    // NOTE: These can be replaced
    step: 500,
    minValue: 0,
    maxValue: 10000,
    conversionRate: 1 / 1 /* POINTS PER PESO */,
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
        disableSuccessBeep: false, // iOS and Android
      };

      cordova.plugins.barcodeScanner.scan(
        this.barcodeSuccess,
        this.barcodeError,
        options
      );
    },
    barcodeSuccess(result) {
      console.log(result.text);
      this.clearFields();

      if (result.text.trim().length > 0) {
        // this.voucher = result.text;
        this.verifyCard(result.text);
      }
    },
    barcodeError(error) {
      alert("Scanning failed: " + error);
    },
    clearFields() {
      this.name = "";
      this.scanned = false;
      this.cardNumber = "";
      this.cardExpiry = "";
      this.memberLevel = "";
      this.elligible = false;
      this.pointsAvailable = "";
    },
    processRedemption() {
      throw Exception();
      // const { brand, branch, url } = this.$store.getters;
      // this.$f7.dialog.preloader("Processing item for redemption");
      // const verRdParam = JSON.stringify({
      //   brand: brand,
      //   branch: branch,
      //   voucher: this.voucher,
      //   deviceID: device.uuid,
      // });
      // const baseURI = `${url}/moment/php/terminalredemption.php?param=${verRdParam}`;
      // console.log(`verifyCoupon: (URI) : ${baseURI}`);
      // fetch(baseURI)
      //   .then((result) => result.json())
      //   .then((result) => {
      //     const { message, errorno } = result;
      //     console.log(result);
      //     console.log("verifyCoupon (Error No):" + errorno);
      //     if (parseInt(errorno) === 0) {
      //       this.$f7.dialog.alert(message, "Congratulations");
      //     } else {
      //       this.$f7.dialog.alert(message, "Warning");
      //     }
      //     this.clearFields();
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //     this.$f7.dialog.alert(
      //       "Unable to perform card purchase. Please contact support",
      //       "Warning"
      //     );
      //   })
      //   .finally(() => {
      //     this.$f7.dialog.close();
      //   });
    },
    verifyCoupon(coupon) {
      const { brand, url } = this.$store.getters;
      this.$f7.dialog.preloader("Verifying coupon");

      const param = JSON.stringify({
        brand: brand,
        voucher: coupon,
        deviceID: device.uuid,
      });

      const baseURI = `${url}/moment/php/terminalverifyredemptionv2.php?param=${param}`;
      console.log(`verifyCoupon: (URI) : ${baseURI}`);

      fetch(baseURI)
        .then((result) => result.json())
        .then((result) => {
          const { errorno, message, data } = result;

          console.log("verifyCoupon (Error No):" + errorno);
          if (parseInt(errorno) === 0) {
            const {
              Name: name,
              CardExpiry: cardExpiry,
              PointsAvailable: pointsAvailable,
              MemberCardNumber: memberCardNumber,

              // REVIEW: Check this variable after backend is opened
              MemberLevel: memberLevel,
            } = data[0];

            // REVIEW: Add memberLevel
            this.memberLevel = memberLevel;
            this.name = name;
            this.cardNumber = memberCardNumber;
            this.cardExpiry = cardExpiry;
            this.pointsAvailable = pointsAvailable;
            this.scanned = true;
          } else {
            this.$f7.dialog.alert(message, "Warning");
            this.clearFields();
          }
        })
        .catch((error) => {
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
    // ANCHOR: verifyCard(cardNumber)
    async verifyCard(cardNumber) {
      const { url } = this.$store.getters;

      const baseURI = `${url}/moment/php/cardverify.php?param=${cardNumber}&type=0`;
      console.log("purchaseCard: (URI) : " + baseURI);

      try {
        this.$f7.dialog.preloader("Fetching card");

        const response = await fetch(baseURI);
        const result = await response.json();

        this.$f7.dialog.close();

        const { errorno, data, message } = result; // result.data to result;
        if (parseInt(errorno) == 0) {
          const {
            FirstName,
            LastName,
            MemberLevel,
            CardExpiry,
            CardStatus,
            PointsAvailable,
          } = data[0];

          console.log(`verifyCard (Status): ${CardStatus}`);

          this.name = `${FirstName} ${LastName}`;
          this.cardNumber = cardNumber;
          this.memberLevel = MemberLevel;
          this.cardExpiry = CardExpiry;
          this.pointsAvailable = PointsAvailable;

          this.scanned = true;
        } else {
          this.$f7.dialog.alert(message, "Warning");
          this.clearFields();
        }
      } catch (error) {
        console.log(error);
        this.$f7.dialog.alert(
          "Unable to perform card purchase. Please contact support",
          "Warning"
        );
      } finally {
        // this.$f7.dialog.close();
      }
    },
    increment() {
      /**
       * Declare @min as this.minVal
       * Declare @max as this.maxValue
       * Declare @val as this.redeemValue
       * Declare @step as this.step
       */
      const { minValue: min, maxValue: max, redeemValue: val, step } = this;

      /// (min a (max b x)) ensures that a < x < b
      this.redeemValue = Math.max(min, Math.min(max, val + step));
    },
    decrement() {
      const { minValue: min, maxValue: max, redeemValue: val, step } = this;

      this.redeemValue = Math.max(min, Math.min(max, val - step));
    },
    /**
     * Returns a @boolean determining whether the value can still be increased.
     *
     * Condition @isAboveMaximum shows if the @redeemValue is greater than the maximum
     * Condition @nextIsAvailable shows whether @redeemValuecan be increased without
     *   going out of bounds from the available points
     */
    cannotIncrease() {
      const { step, maxValue, pointsAvailable, redeemValue } = this;

      const isAboveMaximum = redeemValue >= maxValue;
      const nextIsAvailable = pointsAvailable < redeemValue + step;

      return isAboveMaximum || nextIsAvailable;
    },
  },
};
</script>

<style scoped>
e-center {
  text-align: center;
}

[noclip] {
  text-overflow: clip;
}

.title-number {
  font-size: 32px;
}

.desc-subtitle {
  font-size: 12px;
}

.whole-body {
  height: 100%;
  width: 100%;
}

.center-flex {
  display: flex;
  justify-content: center;
  align-items: center;
}

.button-bar {
  border-top: 24px;
  display: flex;
  justify-content: center;
}

.inner-button-bar {
  width: 80%;
}

.increment-number {
  text-align: center;
  font-size: 24px;
}

.scan-button {
  --width: 200px;
  --height: 200px;

  width: var(--width);
  height: var(--height);
  position: absolute;
  left: 50%;
  margin-left: calc(var(--width) / -2);
  top: 50%;
  margin-top: calc(var(--height) / -2);
  display: flex;
  justify-content: center;
  align-items: center;
}

.description-text {
  margin-left: 12px;
  margin-right: 12px;
}
</style>
