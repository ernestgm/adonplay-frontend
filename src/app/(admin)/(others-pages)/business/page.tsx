import BasicTableOne from "@/components/tables/BasicTableOne";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export default function BusinessPage() {
  return (
      <div>
          <PageBreadcrumb pageTitle="Business" />
          <div className="space-y-6">
              <ComponentCard title="Business">
                  <BasicTableOne />
              </ComponentCard>
          </div>
      </div>
  );
}
