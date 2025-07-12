import BasicTableOne from "@/components/tables/BasicTableOne";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export default function BusinessPage() {
  return (
      <div>
          <PageBreadcrumb pageTitle="Business" />
          <div className="space-y-6">
              <ComponentCard title="Business">
                  <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                          <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky right-0 bg-gray-50 z-10">
                                  Acciones
                              </th>
                          </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                              <td className="px-6 py-4 whitespace-nowrap">1</td>
                              <td className="px-6 py-4 whitespace-nowrap">Juan</td>
                              <td className="px-6 py-4 whitespace-nowrap sticky right-0 bg-white z-10">
                                  <button className="text-blue-500">Editar</button>
                              </td>
                          </tr>
                          {/* Más filas */}
                          </tbody>
                      </table>
                  </div>
              </ComponentCard>
          </div>
      </div>
  );
}
