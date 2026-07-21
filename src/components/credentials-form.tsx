"use client";

import { useRef, useState, useTransition } from "react";
import {
  removeDiploma,
  saveLicenseNumber,
  uploadDiploma,
  uploadLicenseDoc,
} from "@/app/actions/credentials";
import { useI18n } from "@/lib/i18n";

const INPUT_CLASS =
  "mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500";
const LABEL_CLASS = "block text-sm font-medium text-stone-700";
const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

interface CredentialsFormProps {
  licenseNumber: string | null;
  licenseDocPath: string | null;
  diplomaPaths: string[];
  verifiedAt: string | null;
}

/** Nome legível de um caminho tipo "<id>/license-1730000000.pdf". */
function fileLabel(path: string): string {
  const name = path.split("/").pop() ?? path;
  return name.replace(/-\d{10,}/, "");
}

export function CredentialsForm({
  licenseNumber,
  licenseDocPath,
  diplomaPaths,
  verifiedAt,
}: CredentialsFormProps) {
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ error?: string; ok?: boolean } | null>(null);
  const licenseFileRef = useRef<HTMLInputElement>(null);
  const diplomaFileRef = useRef<HTMLInputElement>(null);

  function run(action: () => Promise<{ error: string } | { success: true }>) {
    setMessage(null);
    startTransition(async () => {
      const res = await action();
      setMessage("error" in res ? { error: res.error } : { ok: true });
    });
  }

  function submitNumber(formData: FormData) {
    run(() => saveLicenseNumber(formData));
  }

  function uploadFile(file: File, kind: "license" | "diploma") {
    const fd = new FormData();
    fd.append("document", file);
    run(() => (kind === "license" ? uploadLicenseDoc(fd) : uploadDiploma(fd)));
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">{t("credentials.title")}</h2>
      <p className="mt-1 text-sm text-stone-600">{t("credentials.description")}</p>

      {verifiedAt ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {t("credentials.verified")}
        </p>
      ) : licenseNumber ? (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {t("credentials.pending")}
        </p>
      ) : null}

      {/* Número da cédula — obrigatório para enviar o perfil para avaliação. */}
      <form action={submitNumber} className="mt-4">
        <label htmlFor="license_number" className={LABEL_CLASS}>
          {t("credentials.numberLabel")}
        </label>
        <div className="flex gap-2">
          <input
            id="license_number"
            name="license_number"
            defaultValue={licenseNumber ?? ""}
            required
            maxLength={40}
            placeholder={t("credentials.numberPlaceholder")}
            className={INPUT_CLASS}
          />
          <button
            type="submit"
            disabled={pending}
            className="mt-1 shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
          >
            {t("credentials.save")}
          </button>
        </div>
        <p className="mt-1 text-xs text-stone-500">{t("credentials.numberHint")}</p>
      </form>

      {/* Documento da cédula. */}
      <div className="mt-6">
        <span className={LABEL_CLASS}>{t("credentials.docLabel")}</span>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {licenseDocPath ? (
            <span className="rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-700">
              {fileLabel(licenseDocPath)}
            </span>
          ) : (
            <span className="text-sm text-stone-500">{t("credentials.docEmpty")}</span>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => licenseFileRef.current?.click()}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-violet-500 hover:text-violet-700 disabled:opacity-50"
          >
            {licenseDocPath ? t("credentials.replace") : t("credentials.choose")}
          </button>
        </div>
        <input
          ref={licenseFileRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f, "license");
            e.target.value = "";
          }}
        />
        <p className="mt-1.5 text-xs text-stone-500">{t("credentials.docHint")}</p>
      </div>

      {/* Diplomas, opcionais. */}
      <div className="mt-6">
        <span className={LABEL_CLASS}>{t("credentials.diplomasLabel")}</span>
        {diplomaPaths.length > 0 && (
          <ul className="mt-2 space-y-2">
            {diplomaPaths.map((path) => (
              <li
                key={path}
                className="flex items-center justify-between gap-3 rounded-lg bg-stone-100 px-3 py-2"
              >
                <span className="truncate text-sm text-stone-700">{fileLabel(path)}</span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    const fd = new FormData();
                    fd.append("path", path);
                    run(() => removeDiploma(fd));
                  }}
                  className="shrink-0 text-sm text-red-600 transition-colors hover:text-red-800 disabled:opacity-50"
                >
                  {t("credentials.remove")}
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          disabled={pending || diplomaPaths.length >= 5}
          onClick={() => diplomaFileRef.current?.click()}
          className="mt-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-violet-500 hover:text-violet-700 disabled:opacity-50"
        >
          {t("credentials.addDiploma")}
        </button>
        <input
          ref={diplomaFileRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f, "diploma");
            e.target.value = "";
          }}
        />
        <p className="mt-1.5 text-xs text-stone-500">{t("credentials.diplomasHint")}</p>
      </div>

      {message?.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {message.error}
        </p>
      )}
      {message?.ok && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {t("credentials.saved")}
        </p>
      )}
    </section>
  );
}
