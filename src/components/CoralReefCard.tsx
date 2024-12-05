import React from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  ResultsCard,
  useSketchProperties,
  HorizontalStackedBar,
  Collapse,
  Table,
  ObjectiveStatus,
  VerticalSpacer,
} from "@seasketch/geoprocessing/client-ui";
import {
  percentWithEdge,
  roundDecimalFormat,
  squareMeterToKilometer,
} from "@seasketch/geoprocessing/client-core";

// Import CoralReefResults to type-check data access in ResultsCard render function
import { CoralReefResults } from "../functions/coralReef.js";

export const CoralReefCard = () => {
  const { t } = useTranslation();
  const [{ isCollection }] = useSketchProperties();
  const titleTrans = t("CoralReefCard title", "Coral Reef");
  return (
    <>
      <ResultsCard title={titleTrans} functionName="coralReef">
        {(data: CoralReefResults) => {
          const target = 0.2; // 20%
          const reefPerc = data.sketchArea / data.totalArea;
          const reefPercString = percentWithEdge(reefPerc);
          const targetPercString = percentWithEdge(target);

          const meetsObjective = reefPerc >= target;

          // Adjust values for chart to be in range 0-100
          const chartRows = [[[reefPerc * 100]]];

          const sketchTypeStr = isCollection
            ? t("sketch collection")
            : t("sketch");

          const meetsOrNotElement = meetsObjective ? (
            <Trans i18nKey="CoralReefCard meets objective message">
              This {{ sketchTypeStr }} meets the objective of protecting{" "}
              {{ targetPercString }} of coral reef
            </Trans>
          ) : (
            <Trans i18nKey="CoralReefCard does not meet objective message">
              This {{ sketchTypeStr }} does not meet the objective of protecting{" "}
              {{ targetPercString }} of coral reef
            </Trans>
          );

          return (
            <>
              <p>
                <Trans i18nKey="CoralReefCard reef size message">
                  {{ reefPercString }} of all Micronesia coral reef is within
                  this {{ sketchTypeStr }}.
                </Trans>
              </p>
              {isCollection && (
                <ObjectiveStatus
                  status={meetsObjective ? "yes" : "no"}
                  msg={meetsOrNotElement}
                />
              )}

              <VerticalSpacer />
              <HorizontalStackedBar
                rows={chartRows}
                valueFormatter={(value) => percentWithEdge(value / 100)}
                max={4}
                target={20}
                targetValueFormatter={(targetValue) => (
                  <Trans i18nKey="CoralReefCard target label">
                    Target {{ targetValue: percentWithEdge(targetValue / 100) }}
                  </Trans>
                )}
                rowConfigs={[
                  {
                    title: t("Total coral reef"),
                  },
                ]}
                blockGroupNames={[]}
                blockGroupStyles={[{ backgroundColor: "#64c2a6" }]}
              />
              {isCollection && (
                <Collapse title={t("Show By Sketch")}>
                  <Table
                    data={data.childSketchAreas}
                    columns={[
                      {
                        Header: t("Name"),
                        accessor: "name",
                      },
                      {
                        Header: t("Reef within Sketch (km²)"),
                        accessor: (row: any) =>
                          roundDecimalFormat(squareMeterToKilometer(row.area)),
                      },
                      {
                        Header: t("% Reef within Sketch"),
                        accessor: (row: any) =>
                          percentWithEdge(row.area / data.totalArea),
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
