"use client";

import { useRef, useState } from "react";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { ImagePlus, Loader2, Star, TriangleAlert, X } from "lucide-react";
import { toast } from "sonner";

import { getFirebaseStorage } from "@/lib/firebase/client";
import { isFirebaseClientConfigured } from "@/lib/firebase/config";
import { resizeImageFile } from "@/lib/image";
import type { VehiclePhoto } from "@/types/vehicle";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

interface UploadingItem {
  id: string;
  previewUrl: string;
  progress: number;
  error?: string;
}

interface PhotoUploaderProps {
  photos: VehiclePhoto[];
  onChange: (photos: VehiclePhoto[]) => void;
  /** Storage folder these photos live under, e.g. `vehicles/<id>`. */
  storageFolder: string;
}

export function PhotoUploader({ photos, onChange, storageFolder }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingItem[]>([]);

  if (!isFirebaseClientConfigured) {
    return (
      <Alert variant="destructive">
        <TriangleAlert />
        <AlertDescription>
          Firebase no está configurado, así que la subida de fotos está
          deshabilitada. Agrega los valores de{" "}
          <code>NEXT_PUBLIC_FIREBASE_*</code> a <code>.env.local</code>.
        </AlertDescription>
      </Alert>
    );
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    Array.from(fileList).forEach((file) => processFile(file));
  }

  async function processFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error(`${file.name} no es una imagen y fue omitido.`);
      return;
    }

    const uploadId = crypto.randomUUID();
    const previewUrl = URL.createObjectURL(file);
    setUploading((prev) => [...prev, { id: uploadId, previewUrl, progress: 0 }]);

    // Shrink large photos in the browser before they ever hit the network —
    // most phone photos compress from several MB down to a few hundred KB.
    const upload = await resizeImageFile(file);

    if (upload.size > MAX_UPLOAD_BYTES) {
      toast.error(`${file.name} pesa más de 5MB incluso después de redimensionar y fue omitido.`);
      setUploading((prev) => prev.filter((item) => item.id !== uploadId));
      URL.revokeObjectURL(previewUrl);
      return;
    }

    const storage = getFirebaseStorage();
    const path = `${storageFolder}/${uploadId}-${upload.name}`;
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, upload);

    task.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setUploading((prev) =>
          prev.map((item) => (item.id === uploadId ? { ...item, progress } : item))
        );
      },
      () => {
        toast.error(`No se pudo subir ${file.name}. Inténtalo de nuevo.`);
        setUploading((prev) => prev.filter((item) => item.id !== uploadId));
        URL.revokeObjectURL(previewUrl);
      },
      async () => {
        const url = await getDownloadURL(storageRef);
        onChange([...photos, { url, path }]);
        setUploading((prev) => prev.filter((item) => item.id !== uploadId));
        URL.revokeObjectURL(previewUrl);
      }
    );
  }

  async function handleRemove(photo: VehiclePhoto) {
    onChange(photos.filter((item) => item.path !== photo.path));
    try {
      await deleteObject(ref(getFirebaseStorage(), photo.path));
    } catch {
      // Object may already be gone (e.g. never fully committed) — safe to ignore.
    }
  }

  function handleMakeCover(photo: VehiclePhoto) {
    onChange([photo, ...photos.filter((item) => item.path !== photo.path)]);
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo, index) => (
          <div
            key={photo.path}
            className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt="" className="size-full object-cover" />
            {index === 0 ? (
              <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-medium text-foreground shadow-sm">
                <Star className="size-3 fill-current" />
                Portada
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleMakeCover(photo)}
                className="absolute left-1.5 top-1.5 rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-medium text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
              >
                Usar como portada
              </button>
            )}
            <button
              type="button"
              onClick={() => handleRemove(photo)}
              aria-label="Quitar foto"
              className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-destructive hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {uploading.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.previewUrl} alt="" className="size-full object-cover opacity-50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-background/60">
              <Loader2 className="size-5 animate-spin text-foreground" />
              <span className="text-xs font-medium text-foreground">{item.progress}%</span>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
          )}
        >
          <ImagePlus className="size-5" />
          <span className="text-xs font-medium">Agregar fotos</span>
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        La primera foto se usa como portada en todos lados donde se muestra el
        vehículo. Pasa el mouse sobre una foto para usarla como portada o
        quitarla. Las fotos se redimensionan en tu navegador y tienen un
        límite de 5MB cada una.
      </p>

      {photos.length === 0 && uploading.length === 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus />
          Subir fotos
        </Button>
      ) : null}
    </div>
  );
}
