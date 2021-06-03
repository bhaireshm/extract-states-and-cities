const path = require("path");
const fs = require("fs");
const data = "./all_india_PO_list_without_APS_offices_ver2_lat_long.json";
const stateData = "./states.json";

const jsonData = JSON.parse(
  fs.readFileSync(path.join(__dirname, data), "utf-8")
);

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

const notRequired = [
  "officename",
  "officeType",
  "Deliverystatus",
  "Related Suboffice",
  "Related Headoffice",
  "Telephone",
  "circlename",
];

const states =
  JSON.parse(fs.readFileSync(path.join(__dirname, stateData), "utf-8")) || [];

jsonData.forEach((jd) => {
  notRequired.forEach((nr) => {
    delete jd[nr];
  });
  addState(jd);
  addCity(jd);
  addTaluk(jd);
});

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
  if (!state.cities.some((c) => c.cityname == data.Districtname)) {
    states[stateIndex].cities.push({ cityname: data.Districtname });
    console.info(data.Districtname, "city added.");
  } else {
    addTaluk(data);
  }
}

function addTaluk(data) {
  const state = states.find((s) => s.statename == data.statename);
  const stateIndex = states.findIndex((s) => s.statename == data.statename);
  const city = state.cities.find((c) => c.cityname == data.Districtname);
  const cityIndex = state.cities.findIndex(
    (c) => c.cityname == data.Districtname
  );

  // check if empty
  if (!city.hasOwnProperty("regions")) {
    states[stateIndex].cities[cityIndex]["regions"] = [];
  }

  //   check for exstin taluk
  if (
    !states[stateIndex].cities[cityIndex].regions.some(
      (t) => t.talukname == data.Taluk
    )
  ) {
    states[stateIndex].cities[cityIndex].regions.push({
      talukname: data.Taluk,
      regionname: data.regionname,
      divisionname: data.divisionname,
      pincode: data.pincode,
      longitude: data.longitude,
      latitude: data.latitude,
    });
    console.info(data.Taluk, "taluk added.");
  } else {
    // console.log("Taluk exists.");
  }
}

console.log(states);
fs.writeFileSync(path.join(__dirname, "states.json"), JSON.stringify(states));
