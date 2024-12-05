import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SegmentControl,
  ReportPage,
  SketchAttributesCard,
} from "@seasketch/geoprocessing/client-ui";
import Translator from "../components/TranslatorAsync.js";
import { SimpleCard } from "../components/SimpleCard.js";
import { CoralReefCard } from "../components/CoralReefCard.js";

const enableAllTabs = false;
const BaseReport = () => {
  const { t } = useTranslation();
  const segments = [
    { id: "OVERVIEW", label: t("Overview") },
    { id: "BIOLOGICAL", label: t("Biological") },
  ];
  const [tab, setTab] = useState<string>("OVERVIEW");

  return (
    <>
      <div style={{ marginTop: 5 }}>
        <SegmentControl
          value={tab}
          onClick={(segment) => setTab(segment)}
          segments={segments}
        />
      </div>
      <ReportPage hidden={!enableAllTabs && tab !== "OVERVIEW"}>
        <SimpleCard />
        <SketchAttributesCard autoHide />
      </ReportPage>
      <ReportPage hidden={!enableAllTabs && tab !== "BIOLOGICAL"}>
        <CoralReefCard />
      </ReportPage>
    </>
  );
};

// Named export loaded by storybook
export const TabReport = () => {
  return (
    <Translator>
      <BaseReport />
    </Translator>
  );
};

// Default export lazy-loaded by production ReportApp
export default TabReport;
