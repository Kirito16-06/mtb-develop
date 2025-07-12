

import DashboardCentrePart from "@/components/adminDashboard/CentrePart";
export default function AdminDashboard() {
  return (
    <div className="flex bg-white rounded-lg">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <DashboardCentrePart />
        </div>
      </div>
    </div>
  );
}
