import { GetDBUser } from "@/app/actions/user_action";
import { getUserDesigns } from "@/lib/data/designs";
import UploadDesign from "@/components/upload-design";

export default async function MyDesignsPage() {
  const [designs, dbUser] = await Promise.all([
    getUserDesigns(),
    GetDBUser(),
  ]);

  return <UploadDesign designs={designs} userId={dbUser?.id ?? ""} />;
}
