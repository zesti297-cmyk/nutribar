"use client";

import { useEffect, useRef, useState } from "react";
import { uploadProfilePhoto } from "@/app/actions/upload";
import { useI18n } from "../lib/i18n";

// O card da landing usa 4:5 (176x220). Exportamos maior para telas retina.
const OUT_W = 600;
const OUT_H = 750;
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

interface PhotoUploadProps {
  currentUrl: string;
  onUploaded?: (url: string) => void;
}

export function PhotoUpload({ currentUrl, onUploaded }: PhotoUploadProps) {
  const { t } = useI18n();
  const [src, setSrc] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(currentUrl);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  // A imagem escolhida vira um object URL; revogamos ao trocar/desmontar.
  useEffect(() => {
    if (!src) return;
    const image = new Image();
    image.onload = () => {
      setImg(image);
      setZoom(1);
      setPos({ x: 0, y: 0 });
    };
    image.src = src;
    return () => {
      image.onload = null;
    };
  }, [src]);

  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);

  // Escala mínima que ainda cobre todo o quadro — impede sobrar borda vazia.
  function baseScale(image: HTMLImageElement) {
    return Math.max(OUT_W / image.width, OUT_H / image.height);
  }

  // Mantém o recorte dentro da imagem, para nunca sobrar área transparente.
  function clamp(next: { x: number; y: number }, image: HTMLImageElement, z: number) {
    const s = baseScale(image) * z;
    const halfExtraW = Math.max(0, (image.width * s - OUT_W) / 2);
    const halfExtraH = Math.max(0, (image.height * s - OUT_H) / 2);
    return {
      x: Math.max(-halfExtraW, Math.min(halfExtraW, next.x)),
      y: Math.max(-halfExtraH, Math.min(halfExtraH, next.y)),
    };
  }

  // Redesenha o preview a cada mudança de zoom/posição.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = baseScale(img) * zoom;
    const w = img.width * s;
    const h = img.height * s;

    ctx.clearRect(0, 0, OUT_W, OUT_H);
    ctx.drawImage(img, (OUT_W - w) / 2 + pos.x, (OUT_H - h) / 2 + pos.y, w, h);
  }, [img, zoom, pos]);

  function pick(file: File) {
    setError(null);
    setSaved(false);
    if (!file.type.startsWith("image/")) {
      setError(t("photoUpload.invalidType"));
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError(t("photoUpload.tooLarge"));
      return;
    }
    if (src) URL.revokeObjectURL(src);
    setSrc(URL.createObjectURL(file));
  }

  function startDrag(clientX: number, clientY: number) {
    drag.current = { x: clientX, y: clientY, ox: pos.x, oy: pos.y };
  }

  function moveDrag(clientX: number, clientY: number, rect: DOMRect) {
    if (!drag.current || !img) return;
    // O canvas é exibido menor que 600x750; converte o movimento para escala real.
    const ratio = OUT_W / rect.width;
    const next = {
      x: drag.current.ox + (clientX - drag.current.x) * ratio,
      y: drag.current.oy + (clientY - drag.current.y) * ratio,
    };
    setPos(clamp(next, img, zoom));
  }

  function changeZoom(z: number) {
    if (!img) return;
    setZoom(z);
    setPos((p) => clamp(p, img, z));
  }

  async function save() {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    setBusy(true);
    setError(null);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85),
    );
    if (!blob) {
      setError(t("photoUpload.error"));
      setBusy(false);
      return;
    }

    const fd = new FormData();
    fd.append("photo", new File([blob], "photo.jpg", { type: "image/jpeg" }));
    const res = await uploadProfilePhoto(fd);

    if (res.error) {
      setError(res.error);
    } else if (res.url) {
      setPreview(res.url);
      setSaved(true);
      onUploaded?.(res.url);
      if (src) URL.revokeObjectURL(src);
      setSrc(null);
      setImg(null);
    }
    setBusy(false);
  }

  function cancel() {
    if (src) URL.revokeObjectURL(src);
    setSrc(null);
    setImg(null);
    setError(null);
  }

  return (
    <div>
      <span className="block text-sm font-medium text-stone-700">
        {t("photoUpload.label")}
      </span>

      {!img && (
        <div className="mt-2 flex items-center gap-4">
          <div className="h-28 w-[90px] shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
            {preview ? (
              // Foto já salva: <img> em vez de next/image porque a URL do
              // Storage é dinâmica e não precisa de otimização aqui.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-stone-400">
                {t("photoUpload.empty")}
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:border-violet-500 hover:text-violet-700"
            >
              {preview ? t("photoUpload.change") : t("photoUpload.choose")}
            </button>
            <p className="mt-1.5 text-xs text-stone-500">{t("photoUpload.help")}</p>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) pick(f);
          e.target.value = "";
        }}
      />

      {img && (
        <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <p className="mb-3 text-xs text-stone-600">{t("photoUpload.dragHint")}</p>

          <canvas
            ref={canvasRef}
            width={OUT_W}
            height={OUT_H}
            className="mx-auto block w-40 cursor-move touch-none rounded-lg border border-stone-300 bg-white"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              startDrag(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (drag.current) moveDrag(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
            }}
            onPointerUp={() => { drag.current = null; }}
            onPointerCancel={() => { drag.current = null; }}
          />

          <label className="mt-4 block">
            <span className="text-xs text-stone-600">{t("photoUpload.zoom")}</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => changeZoom(Number(e.target.value))}
              className="mt-1 w-full accent-violet-600"
            />
          </label>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
            >
              {busy ? t("photoUpload.saving") : t("photoUpload.save")}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={busy}
              className="rounded-lg border border-stone-300 px-5 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-100 disabled:opacity-50"
            >
              {t("photoUpload.cancel")}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {saved && (
        <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {t("photoUpload.saved")}
        </p>
      )}
    </div>
  );
}
