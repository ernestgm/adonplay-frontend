import BasicTableOne from "@/components/tables/BasicTableOne";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export default function SlidesPage() {
  return (
      <div>
          <PageBreadcrumb pageTitle="Slides" />
          <div className="space-y-6">
              <ComponentCard title="Slides">
                  <BasicTableOne />
              </ComponentCard>
          </div>
      </div>
  );
}
