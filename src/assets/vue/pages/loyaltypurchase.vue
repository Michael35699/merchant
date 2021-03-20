<template>
  <f7-page>
    <f7-navbar title="Purchase moment card" back-link="this.$f7router.navigate('/r')"></f7-navbar>
    <div v-if="chosenCardType == CardTypes.nil">
      <p class="description-text">
        Card must be purchased prior to usage. End user must register the card
        online to activate for use.
      </p>
      <div class="purchase-button">
        <div button style="width: 100%">
          <f7-button raised large fill round @click="requestDigitalCard">Virtual Card</f7-button>
        </div>
        <div style="font-size: 16px; margin: 24px;">or</div>
        <div
          class="content-block justify-content-center align-items-center text-align-center"
          v-on:click="scanCard"
        >
          <f7-icon f7="qrcode_viewfinder" size="40px"></f7-icon>
          <p>Scan physical card</p>
        </div>
      </div>
    </div>
    <div toHide v-else>
      <p class="description-text">
        All fields must be filled up. Make sure to copy the card number on the official receipt.
        You may use an email or a mobile number for the reference.
      </p>
      <div class="title">
        <div class="title-number">{{ cardNumber }}</div>
        <div class="desc-subtitle">This is the card number.</div>
      </div>
      <f7-list form>
        <f7-list-item header="Receipt Number">
          <f7-input
            :value="orNumber"
            @input="orNumber = $event.target.value"
            name="orNumber"
            type="text"
            placeholder="OR Number"
          />
        </f7-list-item>
        <f7-list-item header="Cashier Name">
          <f7-input
            :value="cashierName"
            @input="cashierName = $event.target.value"
            name="cashierName"
            type="text"
            placeholder="Your Name"
          ></f7-input>
        </f7-list-item>
        <f7-list-item
          header="Payment Type"
          smart-select
          :smart-select-params="{
            openIn: 'sheet'
          }"
        >
          <select name="payment_type" v-model="paymentType">
            <option value>None</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
          </select>
        </f7-list-item>
        <f7-list-item header="Reference">
          <f7-input
            :value="reference"
            @input="reference = $event.target.value"
            name="reference"
            type="text"
            placeholder="Email / Phone Number"
          />
        </f7-list-item>
        <f7-list-item header="Receipt File Name">
          <f7-input
            :value="orFileName"
            name="orImage"
            type="text"
            placeholder="Capture Receipt Image"
          />
        </f7-list-item>
      </f7-list>
      <span class="input-clear-button"></span>
      <div
        class="content-block justify-content-center align-items-center text-align-center"
        v-on:click="captureReceipt"
      >
        <f7-icon f7="camera_viewfinder" size="40px"></f7-icon>
        <p>Capture Receipt</p>
      </div>

      <f7-block class="justify-content-center align-items-center text-align-center">
        <f7-row>
          <f7-col></f7-col>
          <f7-col>
            <f7-button raised fill round v-on:click="processPurchase">Purchase</f7-button>
          </f7-col>
          <f7-col></f7-col>
        </f7-row>
      </f7-block>
    </div>
  </f7-page>
</template>

<script>
// NOTE: This is an enum.

const CardTypes = {
  nil: 0,
  digital: 1,
  physical: 2,
};

/* NOTE: Source is from code snippet http://jsfiddle.net/ghvj4gy9/ */

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/* NOTE: Source is from https://stackoverflow.com/questions/16699007/regular-expression-to-match-standard-10-digit-phone-number */

const PHONE_REGEX = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;

export default {
  components: {},
  data: () => ({
    // NOTE: This keeps a reference of the objects in the Vue instance
    CardTypes: CardTypes,
    console: console,
    // NOTE: This should not be erasable.
    purchaseType: "Moment card SRP",

    // NOTE: Mutable data
    chosenCardType: 0,
    cardNumber: "",
    orNumber: "",
    cashierName: "",
    paymentType: "",
    orImage: null,
    orFileName: "",
    scanned: false,
    // NOTE: Previously emailOrNumber
    reference: "",
  }),
  methods: {
    scanCard() {
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
      this.$data.orFileName = "";
      if (result.text != "") {
        this.verifyCard(result.text);
      }
    },
    barcodeError(error) {
      this.$data.orFileName = "";
      alert("Scanning failed: " + error);
    },
    captureReceipt() {
      if (this.$data.cardNumber === "") {
        this.$f7.dialog.alert("Scan card first.", "Reminder");
        return;
      }
      const options = {
        destinatinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        correctOrientation: true,
        cameraDirection: navigator.camera.Direction.BACK,
      };

      navigator.camera.getPicture(
        this.cameraSuccess,
        this.cameraError,
        options
      );
    },
    cameraSuccess(imgData) {
      console.log("cameraSuccess: " + imgData);
      const { brand, branch } = this.$store.getters;
      const _data = this.$data;
      _data.orImage = imgData;
      _data.orFileName = `Purchase_${brand}_${branch}_${_data.cardNumber}.jpg`;
    },
    cameraError() {},
    /**
     * Upload the image first.
     *  if successful, call purchaseCard routine
     *  else, abort
     */
    processPurchase() {
      // validation
      const {
        cardNumber,
        orNumber,
        orFileName,
        paymentType,
        purchaseType,
        cashierName,
        orImage,
        reference,
      } = this.$data;

      const { branchID, url } = this.$store.getters;

      const checks = [
        cardNumber,
        orNumber, //empty
        cashierName, // empty
        paymentType, // empty
        orFileName,
        purchaseType,
        reference,
      ];

      if (checks.some((x) => x === "") || branchID === "") {
        this.$f7.dialog.alert(
          `All fields are mandatory ${
            cardNumber.length == 0 ? "'Card Number'" : ""
          } ${orNumber.length == 0 ? "'OR Number'" : ""} ${
            cashierName.length == 0 ? "'Cashier Name'" : ""
          } ${orFileName.length == 0 ? "'File Name'" : ""} ${
            purchaseType.length == 0 ? "'Purchase Type'" : ""
          } ${reference.length == 0 ? "'Reference'" : ""}`.trim(),
          "Warning"
        );
        return;
      }

      if (![PHONE_REGEX, EMAIL_REGEX].some((regex) => regex.test(reference))) {
        this.$f7.dialog.alert(
          `Invalid email or mobile number format for 'Reference'`,
          "Warning"
        );
        return;
      }
      // this.verifyReference();

      this.$f7.dialog.preloader("Processing Card Purchase");
      const ft = new FileTransfer();
      const options = new FileUploadOptions();
      options.fileKey = "file";
      options.fileName = orFileName;
      options.mimeType = "image/jpg";
      options.chunkedMode = false;
      options.httpMethod = "POST";
      ft.upload(
        orImage,
        `${url}/moment/php/uploadfile.php`,
        this.onUploadSuccess,
        this.onUploadError,
        options
      );
    },
    onUploadSuccess() {
      // perform the purchase transaction
      this.purchaseCard();
    },
    onUploadError() {
      this.$f7.dialog.alert("Error uploading receipt. Please try again.");
    },
    deleteImageFile() {
      window.resolveLocalFileSystemURL(
        this.$data.orImage,
        function (fileEntry) {
          fileEntry.remove(
            function () {
              console.log("File is removed.");
            },
            function (error) {
              console.log("Unable to remove file.");
            }
          );
        }
      );
    },
    clearFields() {
      this.cardNumber = "";
      this.orNumber = "";
      this.cashierName = "";
      this.paymentType = "";
      this.orFileName = "";
      this.reference = "";
      this.scanned = false;
      this.chosenCardType = CardTypes.nil;
    },
    purchaseCard() {
      const { url, branchID } = this.$store.getters;
      const {
        cardNumber,
        orNumber,
        cashierName,
        paymentType,
        orFileName,
        purchaseType,
        reference,
      } = this;

      const stringedParam = JSON.stringify({
        CardNumber: cardNumber,
        OrNumber: orNumber,
        CashierName: cashierName,
        Payment: paymentType,
        ReceiptImage: orFileName,
        TypeOfPurchase: purchaseType,
        Renewal: 0,
        BranchID: branchID,
        DeviceID: device.uuid,
        Reference: reference,
      });

      const baseURI = `${url}/moment/php/cardpurchase.php?param=${stringedParam}`;
      console.log("purchaseCard: (URI) : " + baseURI);

      fetch(baseURI)
        .then((k) => k.json())
        .then((result) => {
          const { errorno, message } = result;

          console.log("purchaseCard:" + errorno);

          if (parseInt(errorno) !== 0) {
            this.$f7.dialog.alert(message, "Warning");
          } else {
            this.$f7.dialog.alert(message, "Congratulations");
            this.clearFields();
            // free up the mobile device cache
            this.deleteImageFile();
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
    verifyCard(cardNumber) {
      this.$f7.dialog.preloader("Verifying card for purchase");

      const { url } = this.$store.getters;

      const baseURI = `${url}/moment/php/cardverify.php?param=${cardNumber}&type=0`;
      console.log("purchaseCard: (URI) : " + baseURI);

      fetch(baseURI)
        .then((result) => result.json())
        .then((result) => {
          const { data, message, errorno } = result;

          if (parseInt(errorno) === 0) {
            console.log("verifyCard (Status):" + CardStatus);
            const [DATA] = data;
            const { CardStatus, CardStatusDesc } = DATA;

            if (parseInt(CardStatus) === 0) {
              this.chosenCardType = CardTypes.physical;

              this.scanned = true;
              this.cardNumber = cardNumber;
            } else {
              this.$f7.dialog.alert(
                "Card Status: " + CardStatusDesc,
                "Warning"
              );
              this.cardNumber = "";
            }
          } else {
            this.$f7.dialog.alert(message, "Warning");
            this.cardNumber = "";
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
    async requestDigitalCard() {
      const { url, deviceID, branch } = this.$store.getters;

      const stringedParam = JSON.stringify({
        deviceid: deviceID,
        branch: branch,
      });
      const baseURI = `${url}/moment/php/terminalrvc.php?param=${stringedParam}`;
      console.log("purchaseCard: (URI) : " + baseURI);

      try {
        const request = await fetch(baseURI);
        const jsonData = await request.json();

        const { data, message, errorno } = jsonData;

        if (parseInt(errorno) === 0) {
          const { MemberCardNumber: receivedCardNumber } = data[0];

          this.cardNumber = receivedCardNumber;
          this.chosenCardType = CardTypes.digital;
        } else {
          this.$f7.dialog.alert(message, "Warning");
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
      // http://choyzuniga.ddns.net
    },
  },
};
</script>

<style scoped>
.description-text {
  margin-left: 12px;
  margin-right: 12px;
}

.title {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.title-number {
  font-size: 32px;
}

.desc-subtitle {
  font-size: 12px;
}

.purchase-button {
  --height: 128px;
  --width: 256px;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: var(--width);
  height: var(--height);
  position: absolute;
  top: 50%;
  margin-top: calc(var(--height) / -2);
  left: 50%;
  margin-left: calc(var(--width) / -2);
}
</style>

