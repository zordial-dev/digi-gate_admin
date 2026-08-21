import { useState, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { QrCode, Copy, Check, Download, Printer, ExternalLink, X } from 'lucide-react';
import type { Organisation } from '@/types';

interface OrgQRModalProps {
  organisation: Organisation | null;
  onClose: () => void;
}

export default function OrgQRModal({ organisation, onClose }: OrgQRModalProps) {
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  if (!organisation) return null;

  const visitorHost = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5174` : 'http://localhost:5174';
  const registrationUrl = `${visitorHost}/visitor/form/${organisation.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    const canvas = qrCanvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    const padding = 40;
    const qrSize = 300;
    const headerHeight = 90;
    const footerHeight = 60;
    
    exportCanvas.width = qrSize + (padding * 2);
    exportCanvas.height = qrSize + padding * 2 + headerHeight + footerHeight;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    ctx.strokeStyle = '#035352';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, exportCanvas.width - 20, exportCanvas.height - 20);

    ctx.fillStyle = '#035352';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(organisation.name || 'Organisation Check-In', exportCanvas.width / 2, padding + 30);

    ctx.fillStyle = '#64748b';
    ctx.font = '13px sans-serif';
    ctx.fillText('Scan QR Code to Check In', exportCanvas.width / 2, padding + 55);

    ctx.drawImage(canvas, padding, padding + headerHeight, qrSize, qrSize);

    ctx.fillStyle = '#035352';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Powered by DIGI-GATE', exportCanvas.width / 2, exportCanvas.height - padding);

    const link = document.createElement('a');
    link.download = `${(organisation.name || 'Org').replace(/\s+/g, '_')}_DigiGate_QR.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#035352]/10 border border-[#035352]/20 flex items-center justify-center text-[#035352]">
              <QrCode className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#172525]">Organisation QR Gate Pass</h2>
              <p className="text-xs text-slate-500 font-medium">{organisation.name} ({organisation.code})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Visual */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <div ref={qrCanvasRef} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-md">
            <QRCodeCanvas
              value={registrationUrl}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="hidden">
            <QRCodeSVG value={registrationUrl} size={200} level="H" />
          </div>
          <p className="text-xs font-bold text-[#035352] mt-3 uppercase tracking-wider">
            {organisation.name}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">Scan to open visitor registration form</p>
        </div>

        {/* URL Field */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Visitor Registration URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={registrationUrl}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-700 outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-[#035352] text-white hover:bg-[#023e3d] shadow-md shadow-[#035352]/20'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleDownloadQR}
            className="flex-1 min-w-[130px] px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-[#172525] border border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4 text-[#035352]" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 min-w-[130px] px-4 py-2.5 rounded-xl font-bold text-xs bg-[#F3E8BC] text-[#172525] hover:bg-[#e8da9d] border border-[#e5d59e] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4 text-[#035352]" />
            <span>Print Standee</span>
          </button>

          <a
            href={registrationUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            title="Open Visitor Form"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </a>
        </div>
      </div>
    </div>
  );
}
