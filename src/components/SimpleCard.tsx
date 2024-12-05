import React from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  Collapse,
  ResultsCard,
  Table,
  useSketchProperties,
} from "@seasketch/geoprocessing/client-ui";
// Import SimpleResults to type-check data access in ResultsCard render function
import { SimpleResults } from "../functions/simpleFunction.js";
import { roundDecimalFormat } from "@seasketch/geoprocessing/client-core";

export const SimpleCard = () => {
  const { t } = useTranslation();
  const [{ isCollection }] = useSketchProperties();
  const titleTrans = t("SimpleCard title", "Simple Report");
  return (
    <>
      <ResultsCard title={titleTrans} functionName="simpleFunction">
        {(data: SimpleResults) => {
          const areaSqKm = data.area / 1_000_000;
          const areaString = roundDecimalFormat(areaSqKm, 0, {
            keepSmallValues: true,
          });
          const sketchStr = isCollection ? t("sketch collection") : t("sketch");

          return (
            <>
              <p>
                <Trans i18nKey="SimpleCard sketch size message">
                  This {{ sketchStr }} is {{ areaString }} km².
                </Trans>
              </p>
              {isCollection && (
                <Collapse title={t("Area By Sketch")}>
                  <Table
                    data={data.childSketchAreas}
                    columns={[
                      {
                        Header: t("Name"),
                        accessor: "name",
                      },
                      {
                        Header: t("Area (km²)"),
                        accessor: (row: any) =>
                          roundDecimalFormat(row.area / 1_000_000, 0, {
                            keepSmallValues: true,
                          }),
                      },
                    ]}
                  />
                </Collapse>
              )}
            </>
          );
        }}
      </ResultsCard>
    </>
  );
};
