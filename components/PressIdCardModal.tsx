'use client';

import React, { useRef } from 'react';
import { Download, ShieldCheck, X, CheckCircle2, Phone, MapPin, Award } from 'lucide-react';
import { ReporterProfile } from '@/lib/news-engine';

interface PressIdCardModalProps {
  reporter: ReporterProfile;
  logoUrl: string;
  onClose: () => void;
}

export function PressIdCardModal({ reporter, logoUrl, onClose }: PressIdCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleDownloadIdCardPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 1040;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Card
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 720, 1040);

    // Deep Crimson Header Banner
    ctx.fillStyle = '#991B1B';
    ctx.fillRect(0, 0, 720, 200);

    // Tricolor Accent Strip
    ctx.fillStyle = '#F97316';
    ctx.fillRect(0, 200, 240, 12);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(240, 200, 240, 12);
    ctx.fillStyle = '#16A34A';
    ctx.fillRect(480, 200, 240, 12);

    // Brand Title in Header
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('నేటి భారతం · NETI BHARATAM', 360, 85);

    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('NATIONAL, STATE, DISTRICT & MANDAL NEWS NETWORK', 360, 130);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('OFFICIAL PRESS IDENTITY CARD', 360, 175);

    // Reporter Photo Box
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(250, 245, 220, 240);
    ctx.strokeStyle = '#991B1B';
    ctx.lineWidth = 6;
    ctx.strokeRect(250, 245, 220, 240);

    // Silhouette inside photo box for instant synchronous canvas export
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(360, 330, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(290, 390, 140, 85);

    // Verified Press Ribbon
    ctx.fillStyle = '#15803D';
    ctx.fillRect(210, 505, 300, 44);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('ADMIN APPROVED · VERIFIED PRESS', 360, 534);

    // Reporter Name & Designation
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(reporter.fullName, 360, 595);

    ctx.fillStyle = '#991B1B';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`MANDAL REPORTER — ${reporter.mandal}`, 360, 635);

    // Details Table
    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 21px sans-serif';
    const startX = 80;
    let startY = 695;
    const lineGap = 44;

    ctx.fillText(`Press ID No      :  ${reporter.idCardNumber}`, startX, startY);
    ctx.fillText(`Reporter Code    :  ${reporter.reporterCode}`, startX, startY + lineGap);
    ctx.fillText(`Assigned Mandal  :  ${reporter.mandal}`, startX, startY + lineGap * 2);
    ctx.fillText(`District         :  ${reporter.district}`, startX, startY + lineGap * 3);
    ctx.fillText(`State            :  ${reporter.state}`, startX, startY + lineGap * 4);
    ctx.fillText(`Mobile Number    :  +91 ${reporter.mobile}`, startX, startY + lineGap * 5);
    ctx.fillText(`Aadhaar KYC      :  Verified (XXXX-XXXX-${reporter.aadhaarNumber.slice(-4)})`, startX, startY + lineGap * 6);

    // Footer Authorization Bar
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 960, 720, 80);
    ctx.fillStyle = '#F8FAFC';
    ctx.textAlign = 'center';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(
      'Authorized by Chief Editor (Admin) · Valid Across Assigned Jurisdiction · 24x7 News Desk',
      360,
      1006
    );

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Neti-Bharatam-Press-ID-${reporter.username}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Official Reporter Press ID Card"
    >
      <div className="relative w-full max-w-md rounded-xl bg-white border border-stone-200 shadow-2xl overflow-hidden my-8">
        {/* Top Crimson Press Header */}
        <div className="bg-red-900 px-6 py-5 text-white relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Press ID Modal"
            className="absolute top-4 right-4 rounded-lg bg-white/15 p-1.5 text-white hover:bg-white/25 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <img
              src={logoUrl || '/icon.svg'}
              alt="Neti Bharatam Logo"
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-lg bg-white p-1 object-contain shrink-0"
            />
            <div>
              <div className="text-xs font-semibold tracking-widest uppercase text-amber-300">
                ACCREDITED MEDIA IDENTIFICATION
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight">నేటి భారతం · PRESS ID</h3>
              <p className="text-xs text-red-100">
                National · State · District · Mandal News Network
              </p>
            </div>
          </div>
        </div>

        {/* Tricolor Bar */}
        <div className="grid grid-cols-3 h-2">
          <div className="bg-orange-500" />
          <div className="bg-stone-100" />
          <div className="bg-green-600" />
        </div>

        {/* Card Body */}
        <div className="p-6 bg-stone-50">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <img
                src={reporter.photoUrl || '/images/reporter-avatar-1.svg'}
                alt={reporter.fullName}
                referrerPolicy="no-referrer"
                className="w-28 h-32 rounded-lg object-cover border-2 border-red-900 bg-white shadow-sm"
              />
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Admin Approved · KYC Verified
              </span>
            </div>

            <h4 className="mt-2 text-xl font-bold text-stone-900">{reporter.fullName}</h4>
            <p className="text-sm font-bold text-red-800 mt-0.5">
              మండల రిపోర్టర్ · Mandal Reporter ({reporter.mandal})
            </p>
          </div>

          <dl className="mt-5 divide-y divide-stone-200 border-t border-b border-stone-200 text-xs">
            <div className="py-2 flex justify-between gap-2">
              <dt className="text-stone-500 font-medium">Press ID Number</dt>
              <dd className="font-mono font-bold text-stone-900 tabular-nums">{reporter.idCardNumber}</dd>
            </div>
            <div className="py-2 flex justify-between gap-2">
              <dt className="text-stone-500 font-medium">Assigned Mandal</dt>
              <dd className="font-bold text-red-900 text-right">{reporter.mandal}</dd>
            </div>
            <div className="py-2 flex justify-between gap-2">
              <dt className="text-stone-500 font-medium">District &amp; State</dt>
              <dd className="font-semibold text-stone-800 text-right">
                {reporter.district}, {reporter.state}
              </dd>
            </div>
            <div className="py-2 flex justify-between gap-2">
              <dt className="text-stone-500 font-medium">Mobile Number</dt>
              <dd className="font-mono font-bold text-stone-900 tabular-nums">+91 {reporter.mobile}</dd>
            </div>
            <div className="py-2 flex justify-between gap-2">
              <dt className="text-stone-500 font-medium">Aadhaar KYC Status</dt>
              <dd className="font-mono font-semibold text-emerald-800 tabular-nums">
                Verified (XXXX-{reporter.aadhaarNumber.slice(-4)})
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-red-800" />
              <span>Authorized by Chief Editor (Admin)</span>
            </div>
            <span className="font-mono tabular-nums">{reporter.reporterCode}</span>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadIdCardPng}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-900 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Press ID Card (PNG)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
