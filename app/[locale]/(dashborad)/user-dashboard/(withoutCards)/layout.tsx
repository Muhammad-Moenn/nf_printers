import type { ReactNode } from "react";
import "react-toastify/dist/ReactToastify.css";

export default async function DesignDashboardLayoutWithoutCards({
  children,
}: {
  children: ReactNode;
}) {

 
  return (
        
              <div className="">{children}</div>
      
     
  );
}
