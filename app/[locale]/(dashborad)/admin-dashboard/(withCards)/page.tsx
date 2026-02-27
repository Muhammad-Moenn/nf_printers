import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AddUserToDB } from "@/app/actions/user_action";
import { BarChart3, ChartLine, ChartPie } from "lucide-react";


export default async function AdminMainPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) redirect("/sign-in");
  // ✅ Add or update user in DB
  await AddUserToDB();
  
  return (
    <div className="text-center -mb-12">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2  gap-4 lg:gap-6 px-6">
               <div
                 className="flex flex-col gap-6   p-6 bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
               dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e]  w-full     border-1 border-gray-300/60 dark:border-gray-600/70 rounded-xl  overflow-hidden  shadow-sm h-full "
               >
                 <div className="flex gap-2 items-center">
                   <ChartLine className="w-5 h-5 text-blue-500" />
                   <h4 className="text-[20px] lg:text-[22px] font-medium text-gray-800 dark:text-gray-200 text-left   ">
                     Orders Over Time
                   </h4>
                 </div>
       
                 {1   ? (
                  <div></div>
                  //  <OrdersLineChart data={weeklyData} />
                 ) : (
                   <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground h-full">
                      <BarChart3 className="w-10 h-10 mb-2 opacity-70" />
                     No weekly data available
                   </div>
                 )}
               </div>
               <div
                 className="w-full bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
                dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e] flex-col       justify-center   items-center border-2 border-gray-200 dark:border-gray-600/70       rounded-xl   overflow-hidden  shadow p-6 h-full pb-0 "
               >
                 {/* for the current month orders status */}
                 <div className="flex gap-2 items-center">
                   <ChartPie className="w-5 h-5 text-blue-500" />
                   <h4 className="text-[20px] lg:text-[22px] font-medium text-gray-800 dark:text-gray-200 text-left   ">
                     Current moth Order Status
                   </h4>
                 </div>
       
                 {1 ? (<div></div>) :( <div className="flex items-center justify-center -mt-2 text-sm text-muted-foreground h-full">
                      <BarChart3 className="w-10 h-10 mb-2 opacity-70" />
                     No monthly data available
                   </div>)}
               </div>
               
             </div>
    </div>
  );
}
