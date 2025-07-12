export interface BaseChartData {
  [key: string]: string | number;
}

// Define props using generic type for chart data
export interface ChartProps<T extends BaseChartData> {
  title: string;
  type: "line" | "bar";
  data: T[];
  xKey: keyof T;
  lines?: { dataKey: keyof T; stroke: string; name: string }[];
  bars?: { dataKey: keyof T; fill: string; name: string }[];
}


export interface HistoryRecord {
  applicationDate: string;
  activatedDate: string;
  views: number;
  clicks: number;
}