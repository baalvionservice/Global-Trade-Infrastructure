'use client';

/**
 * @file mfa-qr.tsx
 * @description Renders whatever the auth-service returns as `qrCodeUrl`. The backend may return
 * either (a) an image the browser can render directly — an `https://…` or `data:image/…` URL — in
 * which case we use an <img>; or (b) a raw `otpauth://totp/…` provisioning URI, which is NOT an
 * image and must NOT be put in an <img src>. In case (b) we surface it as copyable text. The manual
 * `secret` is ALWAYS shown so enrolment works even when no scannable image is available.
 */

import { useMemo } from 'react';

function isRenderableImage(url: string): boolean {
  const v = url.trim().toLowerCase();
  return v.startsWith('data:image/') || v.startsWith('https://') || v.startsWith('http://');
}

interface MfaQrProps {
  qrCodeUrl: string;
  secret: string;
}

export function MfaQr({ qrCodeUrl, secret }: MfaQrProps) {
  const renderable = useMemo(() => isRenderableImage(qrCodeUrl), [qrCodeUrl]);

  return (
    <div className="flex flex-col items-center gap-5">
      {renderable ? (
        <div className="rounded-2xl border-2 bg-white p-4 shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element -- dynamic QR data/remote URL, not a static asset */}
          <img src={qrCodeUrl} alt="MFA authenticator QR code" width={192} height={192} className="h-48 w-48" />
        </div>
      ) : (
        <div className="w-full rounded-2xl border-2 bg-muted/5 p-5 space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            Authenticator provisioning URI
          </p>
          <p className="break-all font-mono text-[11px] text-foreground">{qrCodeUrl}</p>
          <p className="text-[10px] text-muted-foreground">
            Your authenticator could not render a scannable image. Add the account manually with the
            secret below, or paste this URI into an app that accepts otpauth links.
          </p>
        </div>
      )}

      <div className="w-full rounded-2xl border-2 bg-muted/5 p-5 space-y-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
          Manual entry secret
        </p>
        <p className="select-all break-all font-mono text-sm font-bold tracking-[0.15em] text-foreground">
          {secret}
        </p>
        <p className="text-[10px] text-muted-foreground">
          Enter this key in your authenticator app if you cannot scan the code.
        </p>
      </div>
    </div>
  );
}
