"use client";
import { UploadButton, UploadDropzone } from "@/utils/uploadthing";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
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
import {
  deleteDesign,
  getUserDesigns,
  saveDesign,
} from "@/app/actions/designs-action";
import { supabase } from "@/lib/supabaseClient";
type Design = {
  id?: string;
    url: string;
    key: string;
    size?: number | null;
    userId?: string;
    createdAt?: Date;
};

function UploadDesign({designs:initialDesigns}: {designs:Design[]}) {
  const [designs, setDesigns] = useState<Design[]>(initialDesigns);
  const [isLoading, setIsLoading] = useState(false);

  async function loadDesigns() {
      const data:Design[] = await getUserDesigns();
      // console.log("data design", data);
      setDesigns(data);
    }
    // loadDesigns();
  useEffect(() => {
    
     const channel = supabase
          .channel("design-realtime")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "Designs", // <-- IMPORTANT
            },
            (payload) => {
              // console.log("designspayload", payload);
              loadDesigns();
            }
          ).subscribe();
          
      
        return () => {
          channel.unsubscribe();
        };
  }, []);

  const handleUpload = async (design:Design) => {
    try {
      setIsLoading(true);
      const isSaved = await saveDesign(design);
      if (isSaved) {
        toast.success("Successfully Save Completed");
        // setDesigns((prevDesigns) => [design, ...prevDesigns]);
      }
    } catch (error) {
      toast.error("Failed to save design");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (design: Design) => {
    const isDeleted = await deleteDesign(design);
    
    if (isDeleted) {
      toast.success("Design deleted successfully");
    }
    else{
      toast.error("Failed to delete design");
    }
      if(design.key){
        const res = await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: design.key }),
      });

      if (!res.ok) throw new Error("Delete failed from uploadthing");
      }
  };
  return (
    <div className="w-full ">
      <div className="relative">
        <UploadDropzone
          className="dark:bg-gray-950/80 bg-gray-50 rounded-box flex flex-col justify-center border-2 border-gray-600 dark:border-gray-500 border-dashed p-10 xl:py-13  md:px-28 cursor-pointer"
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            if (res && res.length > 0) {
              console.log("callback is called", res[0].size);
              const newDesignUrl = res[0].url;
              const newDesignKey = res[0].key;
              const newDesignSize = res[0].size;
              const newDesign: Design = {
                size:newDesignSize,
                url: newDesignUrl,
                key: newDesignKey,
              };
              handleUpload(newDesign);
            } else {
              console.log("callback is failed");
            }
          }}
          onUploadError={(error: Error) => {
            setIsLoading(false);
            console.error("Upload error:", error);
            toast.error(`Upload Error: ${error.message}`);
          }}
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center dark:bg-black/60 bg-gray-300/40">
            <div className="w-12 h-12 border-4  border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            {/* <div className="flex space-x-[10px]">
              <div className="w-3 h-3 dark:bg-white bg-blue-600 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 dark:bg-white  bg-blue-600 rounded-full animate-pulse delay-200"></div>
              <div className="w-3 h-3 dark:bg-white  bg-blue-600 rounded-full animate-pulse delay-400"></div>
              <div className="w-3 h-3 dark:bg-white  bg-blue-600 rounded-full animate-pulse delay-600"></div>
            </div> */}
          </div>
        )}
      </div>
     { designs.length > 0 ? (
      <>
       <h3 className="text-xl lg:text-2xl font-semibold text-left py-12 pb-8">
         Uploaded Designs
      </h3>
      <div className="w-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6  pb-8">
        {designs.map((design, i) => (
          <div
            key={i}
            className="relative group border rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800"
          >
            <Image
              priority
              height={200}
              width={200}
              src={design.url}
              alt="random"
              className="w-full h-40 md:h-48 object-cover"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/25 opacity-0 hover:opacity-600 transition-opacity flex items-start justify-end gap-3 cursor-pointer p-4">
              <button
                className="cursor-pointer py-[8px] px-2 bg-gray-800/50 hover:bg-gray-800/40 rounded-md"
                onClick={() => window.open(design.url, "_blank")}
                title="Download"
              >
                <Download className="w-4 h-4 text-white" />
              </button>
              <AlertDialog>
                <AlertDialogTrigger className="cursor-pointer bg-red-500/80 hover:bg-red-500/60  py-[8px] px-2 rounded-md" title="Delete Design">
                  
                    
                    <Trash className="w-4 h-4 text-white" />
                  
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
                    <AlertDialogCancel className="cursor-pointer">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="cursor-pointer"
                      onClick={() => handleDelete(design)}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
      </>
     ):(
       <div className="mt-16 text-center">
    <h3 className="text-2xl font-semibold">No designs yet 🎨</h3>
    <p className="text-gray-500 mt-2">
      Upload your first design to start customizing products.
    </p>
  </div>
     )}
    </div>
  );
}

export default UploadDesign;
