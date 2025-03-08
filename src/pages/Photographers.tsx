
import { DashboardLayout } from "@/components/DashboardLayout";
import { PhotographersMenu } from "@/components/PhotographersMenu";

const Photographers = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Photographers
          </h1>
        </div>
        
        <PhotographersMenu />
      </div>
    </DashboardLayout>
  );
};

export default Photographers;
