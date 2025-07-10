import UserTable from "@/components/tables/UserTable";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export default function UserPage() {
  return (
      <div>
          <PageBreadcrumb pageTitle="User" />
          <div className="space-y-6">
              <ComponentCard title="Users">
                  <UserTable />
              </ComponentCard>
          </div>
      </div>
  );
}
