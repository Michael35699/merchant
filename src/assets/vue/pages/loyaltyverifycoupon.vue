<template>
  <f7-page>
    <f7-navbar
      title="Coupon Verification"
      back-link="this.$f7router.navigate('/r')"
    ></f7-navbar>
    <p>Verify that the coupon is valid and not expired.</p>

    <!--div class="content-block justify-content-center align-items-center text-align-center"  v-on:click="scanCard"> 
      <f7-icon f7="qrcode_viewfinder" size="40px"></f7-icon>
      <p>Scan Card</p>
    </div-->
    <f7-list inline-labels no-hairlines-md>
      <f7-list-input
        label="Coupon No."
        type="number"
        placeholder="Type coupon number"
        clear-button
        @input="coupon = $event.target.value"
        :value="coupon"
        :maxlength="7"
        :minlength="4"
      >
        <f7-icon icon="demo-list-icon" slot="media"></f7-icon>
      </f7-list-input>
    </f7-list>
    <f7-block
      class="justify-content-center align-items-center text-align-center"
    >
      <f7-row>
        <f7-col></f7-col>
        <f7-col>
          <f7-button raised fill round v-on:click="verifyCoupon()"
            >Verify</f7-button
          >
        </f7-col>
        <f7-col></f7-col>
      </f7-row>
    </f7-block>

    <div toHide v-if="scanned">
      <f7-block-title>Cardholder Details</f7-block-title>
      <f7-list>
        <f7-list-item header="Card Status" :title="cardStatus">
          <f7-icon slot="media" f7="rectangle_fill_badge_checkmark"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Membership Tier" :title="memberLevel">
          <f7-icon slot="media" f7="doc_person_fill"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Name" :title="name">
          <f7-icon slot="media" f7="doc_text_fill"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Birth Date" v-bind:title="birthDate">
          <f7-icon slot="media" f7="table_fill"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Card Expiry" :title="cardExpiry">
          <f7-icon slot="media" f7="rectangle_fill_badge_xmark"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Purchase To Date" :title="purchaseToDate">
          <f7-icon slot="media" f7="calendar"></f7-icon>
        </f7-list-item>
        <f7-list-item header="Earned Moments" :title="totalPoints">
          <f7-icon slot="media" f7="square_stack_3d_up_fill"></f7-icon>
        </f7-list-item>
        <f7-list-item
          header="Active Moments (may include additional free Moments)"
          :title="pointsAvailable"
        >
          <f7-icon slot="media" f7="gift_alt_fill"></f7-icon>
        </f7-list-item>
      </f7-list>
    </div>
  </f7-page>
</template>
<script>
import axios from "axios";

export default {
  components: {},
  data: () => ({
    coupon: "",
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
    clearFields() {
      //this.cardNumber = "";
      this.coupon = "";
      this.cardStatus = "";
      this.memberLevel = "";
      this.name = "";
      this.mobileNo = "";
      this.cardExpiry = "";
      this.purchaseToDate = "";
      this.totalPoints = "";
      this.pointsAvailable = "";
      this.birthDate = "";
      this.scanned = false;
    },
    verifyCoupon() {
      const { url } = this.$store.getters;
      this.$f7.dialog.preloader("Verifying coupon");

      const { coupon } = this.$data;
      const baseURI = `${url}/moment/php/cardverify.php?param=${coupon}&type=1`;
      console.log("verifyCoupon: (URI) : " + baseURI);

      fetch(baseURI)
        .then(k => k.json())
        .then(result => {
          const { errorno, data, message } = result;

          if (parseInt(errorno) === 0) {
            const [DATA] = data;
            const { CardStatusDesc, MemberLevel, BirthDate } = DATA;
            const { FirstName, LastName, CardExpiry, PurchaseToDate } = DATA;
            const { TotalPointsAwarded, PointsAvailable, CardStatus } = DATA;

            console.log("verifyCoupon (Status):" + CardStatus);
            this.cardStatus = CardStatusDesc;
            this.memberLevel = MemberLevel;
            this.name = `${FirstName} ${LastName}`;
            this.birthDate = BirthDate;
            this.cardExpiry = CardExpiry;
            this.purchaseToDate = PurchaseToDate;
            this.totalPoints = TotalPointsAwarded;
            this.pointsAvailable = PointsAvailable;

            this.scanned = true;
            this.$f7.dialog.alert(message, "Information");
          } else {
            console.log("RESULT: ", result);
            this.$f7.dialog.alert(message, "Warning");
            this.clearFields();
          }
        })
        .catch(error => {
          console.log("verifyCoupon (error): " + error);
          this.$f7.dialog.alert(
            "Unable to perform coupon verification. Please contact support",
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
