import BasicTableOne from "@/components/tables/BasicTableOne";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export default function DevicesPage() {
  return (
      <div>
          <PageBreadcrumb pageTitle="Devices" />
          <div className="space-y-6">
              <ComponentCard title="Devices">
                  <BasicTableOne />
              </ComponentCard>
          </div>
      </div>
  );
}
