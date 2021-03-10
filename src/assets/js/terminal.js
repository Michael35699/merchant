import store from "../../assets/vuex/storage.js";

export let databaseSQLite = null;
export function getTerminalConfig(v) {
  console.log("getTerminal: start...");

  databaseSQLite.transaction(function(transaction) {
    transaction.executeSql(
      "SELECT * FROM terminal_config",
      [],
      function(tx, rs) {
        //store.state.deviceID = rs.rows.item(0).deviceID;
        if (rs.rows.length > 0) {
          console.log(
            "getTerminalConfig: Branch from RS = " + rs.rows.item(0).branchID
          );
          store.state.brand = rs.rows.item(0).brand;
          store.state.branchID = rs.rows.item(0).branchID;
          store.state.branch = rs.rows.item(0).branch;
          store.state.url = rs.rows.item(0).url;
          store.state.supportNumber = rs.rows.item(0).supportNumber;
        }else{
          // for settings to launch
          v.$f7router.navigate("/settings/");
        }
      },
      function(tx, error) {
        alert("SELECT error: " + error.message);
      },
      function() {}
    );
  });
}

export function setTerminalConfig() {
  databaseSQLite.transaction(
    function(transaction) {
      console.log("setTerminal: insert record");
      transaction.executeSql("DELETE FROM terminal_config");
      console.log("SUCCESSFULLY DELETED.");
      transaction.executeSql(
        "INSERT INTO terminal_config(deviceID,brand,branchID,branch,url,supportNumber)VALUES(?,?,?,?,?,?)",
        [
          device.uuid,
          store.getters.brand,
          store.getters.branchID,
          store.getters.branch,
          store.getters.url,
          store.getters.supportNumber
        ]
      );
    },
    function(error) {
      console.log("ERROR: ", error);
      alert("Error occurred while saving.");
    },
    function() {
      console.log("setTerminal: close");
    }
  );
}

export function initTerminalDatabase() {
  databaseSQLite = window.sqlitePlugin.openDatabase({
    name: "merchant.db",
    location: "default"
  });
  databaseSQLite.transaction(
    function(transaction) {
      transaction.executeSql(
        "CREATE TABLE IF NOT EXISTS terminal_config (deviceID text primary key, brand text, branchID integer, branch text, url text, supportNumber text)"
      );
    },
    function(error) {
      console.log("ERROR: ", error);
    }
  );
}
