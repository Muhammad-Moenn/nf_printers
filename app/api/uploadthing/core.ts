import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi, UploadThingError } from "uploadthing/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "16MB",
      maxFileCount: 3,
    },
    // A multi-page PDF is useful when the artwork contains several pages.
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    blob: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      const user = await getCurrentUser();

      if (!user) {
        throw new UploadThingError("Unauthorized");
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      if (file.size > 10 * 1024 * 1024) {
        await new UTApi().deleteFiles(file.key);
        throw new UploadThingError("Files must be 10 MB or smaller.");
      }
      // This code RUNS ON YOUR SERVER after upload
      // console.log("Upload complete for userId:", metadata.userId);
      console.log("File uploaded:", file);
      await prisma.uploadedFile.upsert({
        where: { key: file.key },
        update: { userId: metadata.userId },
        create: { key: file.key, userId: metadata.userId },
      });
      
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return {
        uploadedBy: metadata.userId,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
