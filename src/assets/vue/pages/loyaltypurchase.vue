<template>
  <f7-page>
    <f7-navbar
      title="Purchase moment card"
      back-link="this.$f7router.navigate('/r')"
    ></f7-navbar>
    <p>
      Card must be purchased prior to usage. End user must register the card
      online to activate for use.
    </p>
    <br />
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
            placeholder="Scan Card"
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
          ></f7-input
        ></f7-list-item>
        <f7-list-item
          title="Payment Type"
          smart-select
          :smart-select-params="{
            openIn: 'sheet'
          }"
        >
          <select name="payment_type" v-model="paymentType">
            <option value="">None</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
          </select>
        </f7-list-item>
        <f7-list-item title="Receipt File Name">
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

      <f7-block
        class="justify-content-center align-items-center text-align-center"
      >
        <f7-row>
          <f7-col></f7-col>
          <f7-col>
            <f7-button raised fill round v-on:click="processPurchase"
              >Purchase</f7-button
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
    cardNumber: "",
    purchaseType: "Moment card SRP",
    orNumber: "",
    cashierName: "",
    paymentType: "",
    orImage: null,
    orFileName: "",
    scanned: false
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
        disableSuccessBeep: false // iOS and Android
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
        cameraDirection: navigator.camera.Direction.BACK
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
      const { cardNumber, orNumber, orFileType, orFileName } = this.$data;
      const { paymentType, purchaseType, cashierName, orImage } = this.$data;

      const { branchID, url } = this.$store.getters;

      const checks = [
        cardNumber,
        orNumber, //empty
        cashierName, // empty
        paymentType, // empty
        orFileName,
        purchaseType
      ];

      console.log(
        checks.map(x => x === ""),
        checks
      );

      if (checks.some(x => x === "") || branchID === "") {
        this.$f7.dialog.alert("All fields are mandatory", "Warning");
        return;
      }

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
      window.resolveLocalFileSystemURL(this.$data.orImage, function(fileEntry) {
        fileEntry.remove(
          function() {
            console.log("File is removed.");
          },
          function(error) {
            console.log("Unable to remove file.");
          }
        );
      });
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
      const { url, branchID } = this.$store.getters;
      const { cardNumber, orNumber, cashierName } = this.$data;
      const { paymentType, orFileName, purchaseType } = this.$data;

      const cardPurchaseParam = {
        CardNumber: cardNumber,
        OrNumber: orNumber,
        CashierName: cashierName,
        Payment: paymentType,
        ReceiptImage: orFileName,
        TypeOfPurchase: purchaseType,
        Renewal: 0,
        BranchID: branchID,
        deviceID: device.uuid
      };
      const stringedParam = JSON.stringify(cardPurchaseParam);

      const baseURI = `${url}/moment/php/cardpurchase.php?param=${stringedParam}`;
      console.log("purchaseCard: (URI) : " + baseURI);

      fetch(baseURI)
        .then(k => k.json())
        .then(result => {
          const { errorno, message } = result;

          console.log("purchaseCard:" + errorno);

          if (parseInt(errorno) != 0) {
            this.$f7.dialog.alert(message, "Warning");
          } else {
            this.$f7.dialog.alert(message, "Congratulations");
            this.clearFields();
            // free up the mobile device cache
            this.deleteImageFile();
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
    },
    verifyCard(cardNumber) {
      this.$f7.dialog.preloader("Verifying card for purchase");

      const _data = this.$data;
      const { url } = this.$store.getters;

      const baseURI = `${url}/moment/php/cardverify.php?param=${cardNumber}&type=0`;
      console.log("purchaseCard: (URI) : " + baseURI);

      fetch(baseURI)
        .then(result => result.json())
        .then(result => {
          const { data, message, errorno } = result;

          if (parseInt(errorno) === 0) {
            console.log("verifyCard (Status):" + CardStatus);
            const [DATA] = data;
            const { CardStatus, CardStatusDesc } = DATA;

            if (parseInt(CardStatus) === 0) {
              _data.scanned = true;
              _data.cardNumber = cardNumber;
            } else {
              this.$f7.dialog.alert(
                "Card Status: " + CardStatusDesc,
                "Warning"
              );
              _data.cardNumber = "";
            }
          } else {
            this.$f7.dialog.alert(message, "Warning");
            _data.cardNumber = "";
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
