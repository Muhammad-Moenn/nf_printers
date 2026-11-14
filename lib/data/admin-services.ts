import {
  deleteAdminServiceAction,
  getAdminServicesAction,
  saveAdminServiceAction,
  toggleAdminServiceAction,
} from "@/app/actions/admin-services-action";

export async function getAdminServices() {
  return getAdminServicesAction();
}

export async function saveAdminService(
  ...args: Parameters<typeof saveAdminServiceAction>
) {
  return saveAdminServiceAction(...args);
}

export async function toggleAdminService(
  ...args: Parameters<typeof toggleAdminServiceAction>
) {
  return toggleAdminServiceAction(...args);
}

export async function deleteAdminService(
  ...args: Parameters<typeof deleteAdminServiceAction>
) {
  return deleteAdminServiceAction(...args);
}
