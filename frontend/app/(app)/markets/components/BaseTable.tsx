import React from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const BaseTable = () => {
  const testData = [
    {
      id: 1,
      network: "Base",
      collateral: "ETH",
      loan: "USDC",
      lltv: "75%",
      totalMarketSize: "$1,000,000",
      rate6h: "0.05%",
      utilization: "60%",
      totalLiquidity: "$400,000",
    },
    {
      id: 2,
      network: "Base",
      collateral: "ETH",
      loan: "USDC",
      lltv: "75%",
      totalMarketSize: "$1,000,000",
      rate6h: "0.05%",
      utilization: "60%",
      totalLiquidity: "$400,000",
    },
  ];

  return (
    <Table className="mt-4">
      {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Network</TableHead>
          <TableHead>Collateral</TableHead>
          <TableHead>Loan</TableHead>
          <TableHead>LLTV</TableHead>
          <TableHead>Total Market Size</TableHead>
          <TableHead>6h Rate</TableHead>
          <TableHead>Utilization</TableHead>
          <TableHead>Total Liquidity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {testData.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.network}</TableCell>
            <TableCell>{item.collateral}</TableCell>
            <TableCell>{item.loan}</TableCell>
            <TableCell>{item.lltv}</TableCell>
            <TableCell>{item.totalMarketSize}</TableCell>
            <TableCell>{item.rate6h}</TableCell>
            <TableCell>{item.utilization}</TableCell>
            <TableCell>{item.totalLiquidity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BaseTable;
