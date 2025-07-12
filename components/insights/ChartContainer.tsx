"use client";

import { BaseChartData, ChartProps } from "@/types/client/insights";
import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Define type for each chart data entry

const ChartContainer = <T extends BaseChartData>({
  title,
  type,
  data,
  xKey,
  lines,
  bars,
}: ChartProps<T>) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={xKey as string}
                tick={{ fontSize: 12 }}
                interval={6}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                width={40}
                tickFormatter={(value) =>
                  typeof value === "number" ? value.toLocaleString() : value
                }
              />
              <Tooltip formatter={(value) => [value, title]} />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              {lines?.map((line) => (
                <Line
                  key={line.dataKey as string}
                  type="monotone"
                  dataKey={line.dataKey as string}
                  stroke={line.stroke}
                  name={line.name}
                  dot={{ r: 2 }}
                  activeDot={{ r: 6 }}
                  animationDuration={500}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={xKey as string}
                tick={{ fontSize: 12 }}
                interval={1}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 12 }} width={40} allowDecimals={false} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              {bars?.map((bar) => (
                <Bar
                  key={bar.dataKey as string}
                  dataKey={bar.dataKey as string}
                  fill={bar.fill}
                  name={bar.name}
                  animationDuration={500}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartContainer;
