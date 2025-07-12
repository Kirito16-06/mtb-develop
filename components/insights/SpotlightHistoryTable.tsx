// components/SpotlightHistoryTable.tsx
import React from "react";
import { format } from "date-fns";
import { HistoryRecord } from "@/types/client/insights";


const SpotlightHistoryTable = ({
  history,
  title = "Spotlight History",
}: {
  history: HistoryRecord[];
  title?: string;
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Application Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Activated Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Views
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Connect Clicks
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {history.map((record, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                {format(new Date(record.applicationDate), "MMM dd, yyyy")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {format(new Date(record.activatedDate), "MMM dd, yyyy")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{record.views}</td>
              <td className="px-6 py-4 whitespace-nowrap">{record.clicks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SpotlightHistoryTable;
