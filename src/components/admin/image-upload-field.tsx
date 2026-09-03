"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  name?: string;
  existingUrl?: string | null;
};

export function ImageUploadField({ name = "image", existingUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
  const [fileName, setFileName] = useState<string | null>(null);

  function onPick(file: File | null) {
    if (!file) {
      setPreview(existingUrl ?? null);
      setFileName(null);
      return;
    }
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = "";
    setFileName(null);
    setPreview(existingUrl ?? null);
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      <p className="text-sm font-medium text-slate-300">Product image</p>
      <div
        className={cn(
          "relative flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 bg-[#060b18] p-4 transition hover:border-af-cyan/40",
        )}
      >
        {preview ? (
          <div className="relative h-36 w-full max-w-xs overflow-hidden rounded-lg border border-white/10">
            <Image
              src={preview}
              alt="Product preview"
              fill
              unoptimized
              className="object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <ImagePlus className="h-8 w-8 text-af-cyan/70" />
            <p className="text-sm">Upload a product photo</p>
            <p className="text-xs text-slate-500">PNG, JPG or WebP · up to 5MB</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2">
          <label className="cursor-pointer rounded-lg bg-af-cyan px-4 py-2 text-sm font-semibold text-[#060b18] transition hover:brightness-110">
            {preview ? "Replace image" : "Choose file"}
            <input
              ref={inputRef}
              type="file"
              name={name}
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
          </label>
          {fileName && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
            >
              <X className="h-3.5 w-3.5" />
              Clear selection
            </button>
          )}
        </div>
        {fileName && (
          <p className="text-xs text-slate-500">{fileName}</p>
        )}
        {existingUrl && !fileName && (
          <input type="hidden" name="image_url" value={existingUrl} />
        )}
      </div>
    </div>
  );
}
