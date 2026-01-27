"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash, Download } from "lucide-react";
import UploadDesign from "@/components/upload-design";

type Design = {
  id: number;
  name: string;
  file: File;
  url: string;
};

export default function MyDesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (!file) return;
    const newDesign: Design = {
      id: Date.now(),
      name: file.name,
      file,
      url: URL.createObjectURL(file),
    };
    setDesigns([newDesign, ...designs]);
    setFile(null);
  };

  const handleDelete = (id: number) => {
    setDesigns(designs.filter((d) => d.id !== id));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        {/* <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          My Designs
        </h1> */}
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Upload and manage your designs for future orders.
        </p>
      </div>

     
      <UploadDesign/>
    </div>
  );
}
