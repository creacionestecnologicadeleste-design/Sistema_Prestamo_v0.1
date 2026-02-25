"use client";

import dynamic from "next/dynamic";

const OverviewCards = dynamic(() => import("./_components/overview-cards").then(mod => mod.OverviewCards), { ssr: false });
const InsightCards = dynamic(() => import("./_components/insight-cards").then(mod => mod.InsightCards), { ssr: false });
import { OperationalCards } from "./_components/operational-cards";
import { TableCards } from "./_components/table-cards";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <OverviewCards />
      <InsightCards />
      <OperationalCards />
      <TableCards />
    </div>
  );
}
