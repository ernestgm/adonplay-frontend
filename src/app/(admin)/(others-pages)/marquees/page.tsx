import BasicTableOne from "@/components/tables/BasicTableOne";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export default function MarqueesPage() {
  return (
      <div>
          <PageBreadcrumb pageTitle="Marquees" />
          <div className="space-y-6">
              <ComponentCard title="Marquees">
                  <BasicTableOne />
              </ComponentCard>
          </div>
      </div>
  );
}
