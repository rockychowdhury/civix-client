import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface Attachment {
  id: string;
  url: string;
  type?: string;
  fileType?: string;
  fileName?: string;
}

export function AttachmentGallery({ attachments }: { attachments: Attachment[] }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {attachments.map((file) => {
        const isImg =
          file.fileType === "IMAGE" ||
          file.type?.startsWith("image/") ||
          file.url?.match(/\.(jpeg|jpg|png|webp|gif)/i);

        return (
          <Dialog key={file.id}>
            <DialogTrigger asChild>
              <div className="h-20 w-20 relative rounded-md overflow-hidden cursor-pointer border border-line hover:opacity-80 transition-opacity">
                {isImg ? (
                  <img
                    src={file.url}
                    alt={file.fileName || "Attachment thumbnail"}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-field">
                    <span className="text-xs text-ink/50">Doc</span>
                  </div>
                )}
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-3xl border-line bg-paper p-0 overflow-hidden">
              <div className="w-full h-full bg-black/5 dark:bg-white/5 flex items-center justify-center min-h-[50vh]">
                {isImg ? (
                  <img
                    src={file.url}
                    alt={file.fileName || "Attachment preview"}
                    className="max-w-full max-h-[80vh] object-contain"
                  />
                ) : (
                  <div className="p-8 text-ink">Unsupported preview for this file type.</div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
}
