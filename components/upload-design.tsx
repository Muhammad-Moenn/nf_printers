import { UploadButton, UploadDropzone } from "@/utils/uploadthing";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Download, Trash } from "lucide-react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const imgdesigns = ["/about_img.png", "/printingImage.jpg", "/bg.png"];
function UploadDesign() {
  const [designs, setDesigns] = useState(imgdesigns);
  const handleDelete = (url: any) => {
    setDesigns(designs.filter((d) => d !== url));
  };
  return (
    <div>
      <UploadDropzone
        className="dark:bg-gray-950/80 bg-gray-50  rounded-box flex flex-col justify-center border-2 border-gray-600 dark:border-gray-500 border-dashed p-10  md:px-28 cursor-pointer"
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          console.log("Files: ", res);
          alert("Upload Completed");
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
      <h3 className="text-xl font-semibold text-left py-12 pb-8">
        Previously Uploaded Designs
      </h3>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6  pb-8">
        {designs.map((design, i) => (
          <div
            key={i}
            className="relative group border rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800"
          >
            <Image
              priority
              height={200}
              width={200}
              src={design}
              alt="random"
              className="w-full h-48 object-cover"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/25 opacity-0 hover:opacity-600 transition-opacity flex items-start justify-end gap-3 cursor-pointer p-6">
              <Button
                variant="ghost"
                className="cursor-pointer"
                onClick={() => window.open(design, "_blank")}
                title="Download"
              >
                <Download className="w-6 h-6 text-white" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger >
                  <Button
                    variant="destructive"
                    className="cursor-pointer"

                    title="Delete"
                  >
                    <Trash className="w-6 h-6 text-white" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border border-gray-600 dark:bg-gray-900">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your design.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                    <AlertDialogAction className="cursor-pointer" onClick={() => handleDelete(design)}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UploadDesign;
