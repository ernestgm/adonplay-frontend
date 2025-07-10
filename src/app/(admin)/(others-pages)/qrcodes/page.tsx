import BasicTableOne from "@/components/tables/BasicTableOne";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export default function QrCodesPage() {
  return (
      <div>
          <PageBreadcrumb pageTitle="Qr Codes" />
          <div className="space-y-6">
              <ComponentCard title="Qr Codes">
                  <BasicTableOne />
              </ComponentCard>
          </div>
      </div>
  );
}
