const path = require("path");
const fs = require("fs");
const dataPath =
  "D:\\Cargo-Flo\\Docs\\all_india_PO_list_without_APS_offices_ver2_lat_long.json";
const stateData = "./states.json";
const fetchUrl =
  "https://api.data.gov.in/resource/04cbe4b1-2f2b-4c39-a1d5-1c2e28bc0e32?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json&offset=0&limit=20000";

var jsonData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
const states = JSON.parse(
  fs.readFileSync(path.join(__dirname, stateData), "utf-8")
);

// local
executeProcess();

// server
// fetchFromServer();

function fetchFromServer() {
  console.info("Fetching data from server...");
  var request = require("request");
  var options = {
    method: "GET",
    url: fetchUrl,
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    jsonData = JSON.parse(response.body);
    jsonData = jsonData.records;
    executeProcess(jsonData);
  });
}

function executeProcess() {
  jsonData.forEach((jd) => {
    let d = {};
    for (const k in jd) {
      d[k.toLocaleLowerCase()] = jd[k];
    }
    addState(d);
    addCity(d);
    addtaluk(d);
  });

  console.log(states);
  fs.writeFileSync(path.join(__dirname, "states.json"), JSON.stringify(states));
}

function addState(data) {
  // check if empty
  if (states.length <= 0) {
    states.push({ statename: data.statename });
    console.info(data.statename, "state added.");
  } else if (!states.some((s) => s.statename == data.statename)) {
    // check for existing data
    states.push({ statename: data.statename });
    console.info(data.statename, "state added.");
  } else {
    addCity(data);
  }
}

function addCity(data) {
  // check if city is empty
  const state = states.find((s) => s.statename == data.statename);
  const stateIndex = states.findIndex((s) => s.statename == data.statename);

  if (state && !state.hasOwnProperty("cities")) {
    states[stateIndex].cities = [];
  }

  // check for existing city
  if (!state.cities.some((c) => c.cityname == data.districtname)) {
    states[stateIndex].cities.push({ cityname: data.districtname });
    console.info(data.districtname, "city added.");
  } else {
    addtaluk(data);
  }
}

function addtaluk(data) {
  const state = states.find((s) => s.statename == data.statename);
  const stateIndex = states.findIndex((s) => s.statename == data.statename);
  const city = state.cities.find((c) => c.cityname == data.districtname);
  const cityIndex = state.cities.findIndex(
    (c) => c.cityname == data.districtname
  );

  // check if empty
  if (!city.hasOwnProperty("regions")) {
    states[stateIndex].cities[cityIndex]["regions"] = [];
  }

  //   check for exstin taluk
  if (
    !states[stateIndex].cities[cityIndex].regions.some(
      (t) => t.talukname == data.taluk
    )
  ) {
    states[stateIndex].cities[cityIndex].regions.push({
      talukname: data.taluk,
      regionname: data.regionname,
      divisionname: data.divisionname,
      pincode: data.pincode,
      longitude: data.longitude,
      latitude: data.latitude,
    });
    console.info(data.taluk, "taluk added.");
  } else {
    // console.log("taluk exists.");
  }
}

/**
 * DATA FORMAT
 *
 * states = [{
 *      statename: "",
 *      cities: [{
 *              cityname: "",
 *              regions: [{
 *              regionname: "",
 *              divisionname: "",
 *              talukname: "",
 *              pincode: 123,
 *              longitue: 12.12123,
 *              latitude: 34.1231,
 *          }]
 *      }]
 *  }]
 *
 */
