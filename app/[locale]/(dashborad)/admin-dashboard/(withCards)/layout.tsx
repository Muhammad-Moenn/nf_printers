import type { ReactNode } from "react";
import "react-toastify/dist/ReactToastify.css";

export default async function AdminDashboardLayoutWithCards({
  children,
}: {
  children: ReactNode;
}) {
  
 
  return (
    <div>
      
      <div className="">{children}</div>
    </div>
  );
}
