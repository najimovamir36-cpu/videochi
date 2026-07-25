import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { UploadsTable } from "@/components/dashboard/uploads-table";
import { UploadManager } from "@/components/upload/upload-manager";
import { routes } from "@/config/routes";
import { formatBytes } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { requireSession } from "@/server/services/session-service";
import { workspaceService } from "@/server/services/workspace-service";

export const metadata: Metadata = buildMetadata({
  title: "Uploads",
  path: routes.uploads,
  description: "Upload source footage and manage your video library.",
  noIndex: true,
});

export default async function UploadsPage() {
  const { user } = await requireSession();
  const [uploads, usage] = await Promise.all([
    workspaceService.listUploads(user.id),
    workspaceService.getUsage(user.id),
  ]);

  const librarySize = uploads.reduce((sum, upload) => sum + upload.size, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Uploads"
        description={`${uploads.length} videos · ${formatBytes(librarySize)} of ${formatBytes(
          usage.storageTotal,
        )} storage used`}
      />

      <UploadManager />

      <UploadsTable uploads={uploads} title="Video library" />
    </div>
  );
}
