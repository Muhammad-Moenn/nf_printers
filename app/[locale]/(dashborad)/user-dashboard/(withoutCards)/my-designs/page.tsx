

import { getUserDesigns } from "@/app/actions/designs-action";
import UploadDesign from "@/components/upload-design";



export default async function MyDesignsPage() {
  const designs:any[]=await getUserDesigns()

  

  return (
    <div className="p-6 pt-0 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        {/* <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          My Designs
        </h1> */}
        <p className="text-gray-500 dark:text-gray-400 -mb-2">
          Upload and manage your designs for future orders.
        </p>
      </div>

     
      <UploadDesign designs={designs}/>
    </div>
  );
}
