<template>
  <f7-page>
    <f7-navbar title="Renew moment card" back-link="this.$f7router.navigate('/r')"></f7-navbar>
    <p>Only active cards are renewable.</p>
    <div
      class="content-block justify-content-center align-items-center text-align-center"
      v-on:click="scanCard"
    >
      <f7-icon f7="qrcode_viewfinder" size="40px"></f7-icon>
      <p>Scan Card</p>
    </div>

    <div toHide v-if="scanned">
      <f7-list form>
        <f7-list-item title="Card Number">
          <f7-input
            :value="cardNumber"
            @input="cardNumber = $event.target.value"
            name="cardNumber"
            type="text"
            readonly
          />
        </f7-list-item>
        <f7-list-item title="Receipt Number">
          <f7-input
            :value="orNumber"
            @input="orNumber = $event.target.value"
            name="orNumber"
            type="text"
            placeholder="OR Number"
          />
        </f7-list-item>
        <f7-list-item title="Cashier Name">
          <f7-input
            :value="cashierName"
            @input="cashierName = $event.target.value"
            name="cashierName"
            type="text"
            placeholder="Your Name"
          />
        </f7-list-item>
        <f7-list-item title="Payment Type" smart-select :smart-select-params="{ openIn: 'sheet' }">
          <select name="payment_type" v-model="paymentType" @change="$f7.smartSelect.close()">
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
          </select>
        </f7-list-item>
        <f7-list-item title="Receipt File Name">
          <f7-input
            :value="orFileName"
            @input="orFileName = $event.target.value"
            name="orImage"
            type="text"
            readonly
            placeholder="Capture Receipt"
          />
        </f7-list-item>
      </f7-list>
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
            <f7-button raised fill round v-on:click="processRenewal">Renew Card</f7-button>
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
    cardNumber: "",
    purchaseType: "",
    orNumber: "",
    cashierName: "",
    paymentType: "",
    orImage: null,
    orFileName: "",
    renewalCount: 0,
    scanned: false,
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

      const { cameraSuccess: success, cameraError: error } = this;
      navigator.camera.getPicture(success, error, options);
    },
    getDate() {
      const now = new Date();

      const month = (now.getMonth() + 1).toString();
      const year = now.getFullYear().toString();

      const formattedMonth = month.length < 2 ? `0${month}` : month;
      const formattedYear = year.substr(-2);

      return `${formattedMonth}${formattedYear}`;
    },
    cameraSuccess(imgData) {
      const { brand, branch } = this.$store.getters;
      const { cardNumber, renewalCount } = this;

      this.orImage = imgData;
      this.orFileName = `Renewal_${brand}_${branch}_${cardNumber}_${renewalCount}_${this.getDate()}.jpg`;
    },
    cameraError() {},
    /**
     * Upload the image first.
     *  if successful, call purchaseCard routine
     *  else, abort
     */
    processRenewal() {
      // validation`
      const { cardNumber, orNumber, cashierName } = this.$data;
      const { paymentType, orFileName, orImage } = this.$data;

      const { branchID, url } = this.$store.getters;
      const checks = [
        cardNumber,
        orNumber,
        cashierName,
        paymentType,
        orFileName,
      ];

      if (checks.some((x) => x === "") || this.$store.getters.branchID === "") {
        this.$f7.dialog.alert("All fields are mandatory", "Warning");
        return;
      }

      this.$f7.dialog.preloader("Processing Card Renewal");
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
      this.purchaseType = "";
      this.scanned = false;
    },
    purchaseCard() {
      const _data = this.$data;
      const { cardNumber, orNumber, cashierName } = this.$data;
      const { paymentType, orFileName, purchaseType } = this.$data;
      const { url } = this.$store.getters;
      const cardPurchaseParam = {
        CardNumber: cardNumber,
        OrNumber: orNumber,
        CashierName: cashierName,
        Payment: paymentType,
        ReceiptImage: orFileName,
        TypeOfPurchase: purchaseType,
        Renewal: 1,
        BranchID: this.$store.getters.branchID,
        deviceID: device.uuid,
      };

      const stringedParam = JSON.stringify(cardPurchaseParam);
      const baseURI = `${url}/moment/php/cardpurchase.php?param=${stringedParam}`;
      console.log("purchaseCard: (URI) : " + baseURI);

      fetch(baseURI)
        .then((result) => result.json())
        .then((result) => {
          const { message, errorno } = result;
          console.log("purchaseCard:" + errorno);

          if (parseInt(errorno) === 0) {
            this.$f7.dialog.alert(message, "Congratulations");
            this.clearFields();
            // free up the mobile device cache
            this.deleteImageFile();
          } else {
            this.$f7.dialog.alert(message, "Warning");
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
      const _dialog = this.$f7.dialog;

      const { url } = this.$store.getters;
      const _data = this.$data;

      _dialog.preloader("Verifying card for renewal");
      const baseURI = `${url}/moment/php/cardverify.php?param=${cardNumber}&type=0`;
      console.log("purchaseCard: (URI) : " + baseURI);

      fetch(baseURI)
        .then((k) => k.json())
        .then((result) => {
          const { errorno, data, message } = result;

          console.log(result);
          if (parseInt(errorno) === 0) {
            const [DATA] = data;
            const { CardStatus, RenewalCount, CardStatusDesc } = DATA;
            const stat = parseInt(CardStatus);

            console.log("verifyCard (Status):" + CardStatus);

            if (stat === 1 || stat === 3) {
              _data.cardNumber = cardNumber;
              _data.renewalCount = RenewalCount + 1;
              _data.scanned = true;
            } else {
              _dialog.alert(`Card Status: ${CardStatusDesc}`, "Warning");

              _data.cardNumber = "";
              _data.renewalCount = 0;
            }
          } else {
            _dialog.alert(message, "Warning");
            _data.cardNumber = "";
          }
        })
        .catch((error) => {
          console.log(error);
          _dialog.alert(
            "Unable to perform card purchase. Please contact support",
            "Warning"
          );
        })
        .finally(() => {
          _dialog.close();
        });
    },
  },
};
</script>
