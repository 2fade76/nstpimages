
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const statusData = [
  { name: "Open", value: 4, color: "#22C55E" },
  { name: "In Progress", value: 3, color: "#F59E0B" },
  { name: "On Hold", value: 2, color: "#EF4444" },
  { name: "Complete", value: 5, color: "#6366F1" },
];

const photographerData = [
  { name: "John Smith", assignments: 1 },
  { name: "Emily Johnson", assignments: 1 },
  { name: "Michael Brown", assignments: 1 },
  { name: "Sarah Wilson", assignments: 1 },
];

export const AnalyticsSection = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Assignment Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Assignments per Photographer</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={photographerData}>
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="assignments" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
