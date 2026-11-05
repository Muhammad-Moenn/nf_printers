

import { getUserDesigns } from "@/app/actions/designs-action";
import UploadDesign from "@/components/upload-design";

export default async function MyDesignsPage() {
  const designs = await getUserDesigns();
  return (
    <UploadDesign designs={designs} />
  );
}
