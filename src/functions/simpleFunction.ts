import {
  Sketch,
  SketchCollection,
  Polygon,
  MultiPolygon,
  GeoprocessingHandler,
  toSketchArray,
} from "@seasketch/geoprocessing";
import { area } from "@turf/turf";

export interface SimpleResults {
  /** area of reef within sketch in square meters */
  area: number;
  childSketchAreas: {
    /** Name of the sketch */
    name: string;
    /** Area of the sketch in square meters */
    area: number;
  }[];
}

/**
 * Simple geoprocessing function with custom result payload
 */
async function simpleFunction(
  sketch:
    | Sketch<Polygon | MultiPolygon>
    | SketchCollection<Polygon | MultiPolygon>,
): Promise<SimpleResults> {
  // Add analysis code
  const sketchArea = area(sketch);

  let childSketchAreas: SimpleResults["childSketchAreas"] = [];
  if (sketch.properties.isCollection) {
    childSketchAreas = toSketchArray(sketch).map((sketch) => ({
      name: sketch.properties.name,
      area: area(sketch),
    }));
  }

  // Custom return type
  return {
    area: sketchArea,
    childSketchAreas,
  };
}

export default new GeoprocessingHandler(simpleFunction, {
  title: "simpleFunction",
  description: "Function description",
  timeout: 60, // seconds
  memory: 1024, // megabytes
  executionMode: "async",
});
