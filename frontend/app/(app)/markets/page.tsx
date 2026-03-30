import React from "react";
import TitleInfo from "../components/TitleInfo";
import BaseTable from "./components/BaseTable";

const page = () => {
  return (
    <div className="p-8 h-auto">
      <TitleInfo />
      <BaseTable />
    </div>
  );
};

export default page;
