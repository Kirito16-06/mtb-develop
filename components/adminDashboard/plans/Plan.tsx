"use client";

import { useEffect, useState } from "react";
import { Plan } from "@prisma/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import PageSkeleton from "@/components/PageSkeleton";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    jpMultiplier: number;
    discountPercent: number;
  }>({ jpMultiplier: 0, discountPercent: 0 });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/admin/plans");
      if (!response.ok) throw new Error("Failed to fetch plans");
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      toast.error("Error fetching plans");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan.id);
    setEditValues({
      jpMultiplier: plan.jpMultiplier,
      discountPercent: plan.discountPercent,
    });
  };

  const handleSave = async (planId: string) => {
    try {
      const response = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: planId,
          ...editValues,
        }),
      });

      if (!response.ok) throw new Error("Failed to update plan");

      const updatedPlan = await response.json();
      setPlans(plans.map((p) => (p.id === planId ? updatedPlan : p)));
      setEditingPlan(null);
      toast.success("Plan updated successfully");
    } catch (error) {
      toast.error("Error updating plan");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setEditingPlan(null);
  };

  if (loading) {
    return <PageSkeleton type=" manage-plans" />;  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Plans</h1>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full bg-white border border-gray-300 shadow-sm rounded-lg">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    JP Multiplier
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount (%)
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200">
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {plan.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingPlan === plan.id ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editValues.jpMultiplier}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              jpMultiplier: parseFloat(e.target.value),
                            })
                          }
                          className="border rounded px-2 py-1 w-24"
                        />
                      ) : (
                        plan.jpMultiplier
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingPlan === plan.id ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editValues.discountPercent}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              discountPercent: parseFloat(e.target.value),
                            })
                          }
                          className="border rounded px-2 py-1 w-24"
                        />
                      ) : (
                        plan.discountPercent
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {plan.price}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingPlan === plan.id ? (
                        <div className="space-x-2">
                          <button
                            onClick={() => handleSave(plan.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(plan)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
