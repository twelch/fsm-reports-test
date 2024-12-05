// Run the following command from the project root directory
// npx tsx scripts/coralReefPrecalc.ts

import { area } from "@turf/turf";
import { geojson } from "flatgeobuf";
import { readFileSync } from "fs";
import fs from "fs-extra";

// Fetch all reef features and calculate total area
const buffer = readFileSync(
  `${import.meta.dirname}/../data/dist/reefextent.fgb`,
);
const reefFeatures = geojson.deserialize(new Uint8Array(buffer));
const totalArea = area(reefFeatures);

const reefPrecalc = {
  totalAreaSqMeters: totalArea,
};

fs.ensureDirSync(`${import.meta.dirname}/../data/precalc`);
fs.writeJsonSync(
  `${import.meta.dirname}/../data/precalc/reefextent.json`,
  reefPrecalc,
);
