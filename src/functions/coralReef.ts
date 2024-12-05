import {
  Sketch,
  SketchCollection,
  Polygon,
  MultiPolygon,
  GeoprocessingHandler,
  getFeaturesForSketchBBoxes,
  toSketchArray,
  clipMultiMerge,
  isSketchCollection,
  clip,
  Feature,
} from "@seasketch/geoprocessing";
import project from "../../project/projectClient.js";
import { area, featureCollection } from "@turf/turf";
import reefPrecalc from "../../data/precalc/reefextent.json";

export interface CoralReefResults {
  /** area of all reef extent polygons in square meters */
  totalArea: number;
  /** area of reef extent within sketch or sketch collection in square meters */
  sketchArea: number;
  childSketchAreas: {
    /** Name of the sketch */
    name: string;
    /** Area of reef extent within child sketch in square meters */
    area: number | null;
  }[];
}

/**
 * Simple geoprocessing function with custom result payload
 */
export async function coralReef(
  sketch:
    | Sketch<Polygon | MultiPolygon>
    | SketchCollection<Polygon | MultiPolygon>,
): Promise<CoralReefResults> {
  // Load just the reef features that intersect with the sketch bounding box
  // or in case of a sketch collection, the child sketch bounding boxes
  const ds = project.getInternalVectorDatasourceById("reefextent");
  const url = project.getDatasourceUrl(ds);
  const reefFeatures = await getFeaturesForSketchBBoxes(sketch, url);

  // Add analysis code

  // If collection, calculate area of each sketches intersection with reef
  let childSketchAreas: CoralReefResults["childSketchAreas"] = [];
  if (sketch.properties.isCollection) {
    childSketchAreas = toSketchArray(sketch).map((sketch) => {
      const sketchReefOverlap = clipMultiMerge(
        sketch,
        featureCollection(reefFeatures),
        "intersection",
      );
      return {
        name: sketch.properties.name,
        area: sketchReefOverlap ? area(sketchReefOverlap) : 0,
      };
    });
  }

  // Calculate area of overall sketch intersection with reef
  const sketchArea = (() => {
    // Figure out feature to clip
    let clipFeature: Feature<Polygon | MultiPolygon> | null;
    if (reefFeatures.length === 0) {
      return 0;
    } else if (isSketchCollection(sketch)) {
      // union sketches to remove overlap and avoid double count
      clipFeature = clip(sketch, "union");
      if (!clipFeature) return 0;
    } else {
      clipFeature = sketch;
    }
    //Merge reefFeatures into a single multipolygon, then intersect
    const sketchReefOverlap = clipMultiMerge(
      clipFeature,
      featureCollection(reefFeatures),
      "intersection",
    );
    return sketchReefOverlap ? area(sketchReefOverlap) : 0;
  })();

  // Custom return type
  return {
    totalArea: reefPrecalc.totalAreaSqMeters,
    sketchArea: sketchArea,
    childSketchAreas,
  };
}

export default new GeoprocessingHandler(coralReef, {
  title: "coralReef",
  description: "calculate sketch overlap with reef extent datasource",
  timeout: 60, // seconds
  memory: 1024, // megabytes
  executionMode: "async",
});
