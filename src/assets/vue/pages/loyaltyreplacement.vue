<template>
  <f7-page>
    <f7-navbar
      title="Replace moment card"
      back-link="this.$f7router.navigate('/r')"
    ></f7-navbar>
    <p>
      Verify cardholder"s email and scan new card to confirm card replacement
    </p>

    <f7-block-title>Email verification</f7-block-title>
    <f7-list no-hairlines-md>
      <f7-list-input
        :value="email"
        @input="email = $event.target.value"
        name="email"
        type="email"
        placeholder="cardholder e-mail"
        clear-button
      >
        <f7-icon icon="fas fas fa-user fa-fw" slot="media"></f7-icon>
      </f7-list-input>
    </f7-list>
    <f7-block
      class="justify-content-center align-items-center text-align-center"
    >
      <f7-row>
        <f7-col></f7-col>
        <f7-col>
          <f7-button raised fill round v-on:click="verifyEmail"
            >Verify</f7-button
          >
        </f7-col>
        <f7-col></f7-col>
      </f7-row>
    </f7-block>

    <div v-if="!isCardDetailHidden">
      <f7-block-title>Cardholder Details</f7-block-title>
      <f7-list>
        <f7-list-item header="Old Card Number" v-bind:title="cardNumber">
          <f7-icon slot="media" icon="fas fa-id-card-alt fa-fw"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Name" v-bind:title="name">
          <f7-icon slot="media" icon="fas fa-id-card-alt fa-fw"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Birthdate" v-bind:title="birthDate">
          <f7-icon slot="media" icon="fas fa-id-card-alt fa-fw"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Request Date" v-bind:title="requestDate">
          <f7-icon slot="media" icon="fas fa-id-card-alt fa-fw"></f7-icon>
        </f7-list-item>
      </f7-list>
      <f7-list>
        <f7-list-item checkbox @click="refer"
          >Refer To Other Branch</f7-list-item
        >
      </f7-list>

      <div v-if="referToOthers">
        <f7-list>
          <f7-list-item
            title="Branch"
            smart-select
            :smart-select-params="{
              openIn: 'sheet'
            }"
          >
            <select name="branch_name" @change="changeBranch">
              <option :value="none">None</option>
              <option
                v-for="{ brand, brand_id, branch } in branches.filter(
                  x => x.brand_id !== $store.getters.branchID
                )"
                :key="brand_id"
                :value="branch"
                >{{ branch }}</option
              >
            </select>
          </f7-list-item>
          <f7-block
            class="justify-content-center align-items-center text-align-center"
          >
            <f7-row>
              <f7-col></f7-col>
              <f7-col>
                <f7-button raised fill round @click="transferBranch"
                  >Transfer</f7-button
                >
              </f7-col>
              <f7-col></f7-col>
            </f7-row> </f7-block
        ></f7-list>
      </div>
      <div v-else>
        <f7-block-title>Card Replacement</f7-block-title>
        <div
          class="content-block justify-content-center align-items-center text-align-center"
          v-on:click="scanCard"
        >
          <f7-icon f7="qrcode_viewfinder" size="40px"></f7-icon>
          <p>Scan New Card</p>
        </div>
        <div toHide v-if="scannedNewCard">
          <f7-list form>
            <f7-list-item title="New Card Number">
              <f7-input
                :value="newCardNumber"
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
                type="text"
                placeholder="Your Name"
              />
              <span class="input-clear-button"></span>
            </f7-list-item>
            <f7-list-item
              title="Payment Type"
              smart-select
              :smart-select-params="{ openIn: 'sheet' }"
            >
              <select
                v-model="paymentType"
                @change="$f7.smartSelect.close()"
                name="paymentType"
                placeholder="Please choose..."
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
              </select>
            </f7-list-item>
            <f7-list-item title="Photo of Receipt">
              <f7-input
                :value="orFileName"
                @input="orFileName = $event.target.id"
                name="orImage"
                type="text"
                readonly
                placeholder="OfficialReceipt.jpg"
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

          <f7-block
            class="justify-content-center align-items-center text-align-center"
            v-bind:hidden="isHidden"
          >
            <f7-row>
              <f7-col></f7-col>
              <f7-col>
                <f7-button raised fill round v-on:click="processReplacement()"
                  >Replace</f7-button
                >
              </f7-col>
              <f7-col></f7-col>
            </f7-row>
          </f7-block>
        </div>
      </div>
    </div>
  </f7-page>
</template>
<script>
import axios from "axios";

export default {
  components: {},
  data: () => ({
    email: "",
    cardNumber: "",
    name: "",
    birthDate: "",
    gender: "",
    requestDate: "",
    newCardNumber: "",
    purchaseType: "Replacement",
    orNumber: "",
    cashierName: "",
    paymentType: "",
    orImage: null,
    orFileName: "",
    isHidden: true,
    isCardDetailHidden: true,
    referToOthers: false,
    branches: [],
    newData: {},
    scannedNewCard: false
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
      console.log("SUCCESS! RESULT: ", result.text);
      this.$data.orFileName = "";
      if (result.text !== "") {
        this.verifyCard(result.text);
      }
    },
    barcodeError(error) {
      this.$data.orFileName = "";
      alert("Scanning failed: " + error);
    },
    clearFields() {
      const _data = this.$data;
      _data.email = "";
      _data.name = "";
      _data.cardNumber = "";
      _data.birthDate = "";
      _data.gender = "";
      _data.requestDate = "";
      _data.isCardDetailHidden = true;
    },
    verifyEmail() {
      const _dialog = this.$f7.dialog;

      const _data = this.$data;
      const { email } = this.$data;
      const { brand, branch, url } = this.$store.getters;

      console.log(email);
      _dialog.preloader("Verifying e-mail");
      const param = JSON.stringify({
        brand,
        branch,
        email,
        deviceid: device.uuid
      });

      console.log(`PARAMETERS: ${param}`);
      const baseURI = `${url}/moment/php/terminalverifycardreplacementv2.php?param=${param}`;
      console.log("verifyEmail: (URI) : " + baseURI);

      fetch(baseURI)
        .then(k => k.json())
        .then(result => {
          const { data, errorno, message } = result;

          console.log("verifyEmail (Error No):" + errorno);
          if (parseInt(errorno) === 0) {
            const [DATA] = data;
            console.log("DATA:", DATA);

            const { FirstName, LastName, Gender, RequestDate } = DATA;
            const { MemberCardNumber, BirthDate } = DATA;
            _data.name = FirstName + " " + LastName;
            _data.cardNumber = MemberCardNumber;
            _data.birthDate = BirthDate;
            _data.gender = Gender;
            _data.requestDate = RequestDate;
            _data.isHidden = false;
            _data.isCardDetailHidden = false;
            _data.birthDate = BirthDate;
          } else {
            _dialog.alert(message, "Warning");

            this.$data.isHidden = true;
            this.$data.isCardDetailHidden = true;
          }
        })
        .catch(error => {
          console.log(error);
          _dialog.alert(
            "Unable to perform card replacement. Please contact support",
            "Warning"
          );
        })
        .finally(() => {
          _dialog.close();
        });
    },
    verifyCard(cardNumber) {
      const _data = this.$data;
      const { url } = this.$store.getters;

      this.$f7.dialog.preloader("Verifying card for replacement");
      const baseURI = `${url}/moment/php/cardverify.php?param=${cardNumber}&type=0`;
      console.log("purchaseCard: (URI) : " + baseURI);

      console.log(cardNumber);

      fetch(baseURI)
        .then(k => k.json())
        .then(result => {
          const { data, errorno, message } = result;

          if (parseInt(errorno) === 0) {
            const [DATA] = data;

            const { CardStatus, CardStatusDesc } = DATA;

            console.log("verifyCard (Status): " + CardStatus);
            if (parseInt(CardStatus) === 0) {
              this.$data.newCardNumber = cardNumber;
              this.scannedNewCard = true;

              console.log("CARD SUCCESSFUL!");
            } else {
              this.$f7.dialog.alert(
                `Card Status: ${CardStatusDesc}`,
                "Warning"
              );
              this.$data.newCardNumber = "";

              console.log("CARD UNSUCCESSFUL!");
            }
          } else {
            this.f7.dialog.alert(message, "Warning");
            this.$data.newCardNumber = "";
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
    captureReceipt() {
      if (this.$data.newCardNumber === "") {
        this.$f7.dialog.alert("Scan replacement card first.", "Reminder");
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
      const { newCardNumber } = this.$data;

      this.$data.orImage = imgData;
      this.$data.orFileName = `ReplacementCard_${brand}_${branch}_${newCardNumber}.jpg`;
    },
    cameraError() {},
    /**
     * Upload the image first.
     *  if successful, call purchaseCard routine
     *  else, abort
     */
    processReplacement() {
      // validation
      const { cardNumber, orNumber, cashierName, orImage } = this.$data;
      const { paymentType, orFileName, purchaseType } = this.$data;
      const checks = [
        cardNumber,
        orNumber,
        cashierName,
        paymentType,
        orFileName,
        purchaseType
      ];

      const { branchID, url } = this.$store.getters;
      if (checks.some(x => x === "") || branchID === "") {
        this.$f7.dialog.alert("All fields are mandatory", "Warning");
        return;
      }

      console.log("ORFILENAME: ", orFileName);
      console.log("ORIMAGE: ", orImage);

      this.$f7.dialog.preloader("Processing card replacement");
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
      this.performReplacement();
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
    performReplacement(coupon) {
      const { cardNumber, orNumber, orFileName, purchaseType } = this.$data;
      const { cashierName, email, newCardNumber, paymentType } = this.$data;

      const { url, branch } = this.$store.getters;
      // this.$f7.dialog.preloader("Processing card replacement");
      const verRdParam = {
        Email: email,
        OrNumber: orNumber,
        ReceiptImage: orFileName,
        TypeOfPurchase: purchaseType,
        CashierName: cashierName,
        Branch: branch,
        DeviceID: device.uuid,
        CardNumber: cardNumber,
        NewCardNumber: newCardNumber,
        Payment: paymentType
      };

      console.log(verRdParam);
      console.log(this.$data);
      const param = JSON.stringify(verRdParam);
      const baseURI = `${url}/moment/php/terminalreplacecard.php?param=${param}`;
      console.log("performReplacement: (URI) : " + baseURI);

      fetch(baseURI)
        .then(k => k.json())
        .then(result => {
          const { message, errorno } = result;

          if (parseInt(errorno) != 0) {
            this.$f7.dialog.alert(message, "Warning");
            console.log(`performReplacement (Error No): Warning ${message}`);
          } else {
            this.$f7.dialog.alert(message, "Congratulations");
            this.clearFields();
            console.log(
              `performReplacement (Error No): Congratulations ${message}`
            );
          }
        })
        .catch(error => {
          console.log(error);
          this.$f7.dialog.alert(
            "Unable to perform card replacement. Please contact support",
            "Warning"
          );
        })
        .finally(() => {
          console.log("Finished.");
          this.$f7.dialog.close();
        });
    },
    refer() {
      const { url } = this.$store.getters;

      const URI = `${url}/moment/php/terminalbrandbranchlist.php?deviceid=${device.uuid}`;
      console.log("URI: ", URI);

      if (this.branches.length <= 0) {
        fetch(URI)
          .then(res => res.json())
          .then(result => {
            const { errorno, data, message } = result;

            if (parseInt(errorno) === 0) {
              const { branches } = data;

              this.referToOthers = !this.referToOthers;
              this.$data.branches = branches;
            } else {
              this.$f7.dialog.alert(message, "Warning");
              this.clearFields();
            }
          })
          .catch(error => {
            console.log(error);
            this.$f7.dialog.alert("contact support", "Warning");
          });
      } else {
        this.referToOthers = !this.referToOthers;
      }
    },
    changeBranch() {
      const name = this.$f7.smartSelect.get(".smart-select").$selectEl.val();
      const [branch] = this.branches.filter(k => {
        return k.branch === name;
      });

      this.newData = branch;
      console.log(branch, name);
      this.$f7.smartSelect.close();
    },
    transferBranch() {
      const { url, brand: oldbrand, branch: oldbranch } = this.$store.getters;
      const { email, newData } = this;

      const { branch: newbranch, brand: newbrand } = newData;

      const objParam = {
        email,
        oldbranch,
        oldbrand,
        newbranch,
        newbrand,
        deviceid: device.uuid
      };

      const param = JSON.stringify(objParam);
      const URI = `${url}/moment/php/terminaltransferreplacement.php?param=${param}`;

      console.log("URI: ", URI);

      fetch(URI)
        .then(x => x.json())
        .then(result => {
          const { message, errorno } = result;

          if (parseInt(errorno) === 0) {
            this.$f7.dialog.alert(message, "Congratulations.");
          } else {
            this.$f7.dialog.alert(message, "Warning");
          }
          this.clearFields();
        })
        .catch(err => {
          console.log(err);
          this.$f7.dialog.alert("Please contact support.", "Warning");
        });
    }
  }
};
</script>
