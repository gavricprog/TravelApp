export default function ShareSection({ shareData, shareMessage, accessType, onAccessTypeChange, onGenerate, onCopy, onDownloadQr }) {
  return (
    <div className="surface">
      <h2 className="section-title">
        <span aria-hidden>🔗</span> Share
      </h2>
      <div className="space-y-4">
        <fieldset className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Access mode</legend>
          <div className="flex flex-wrap gap-4 text-sm text-slate-700">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="share-access"
                value="VIEW"
                checked={accessType === 'VIEW'}
                onChange={(e) => onAccessTypeChange(e.target.value)}
              />
              View only
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="share-access"
                value="EDIT"
                checked={accessType === 'EDIT'}
                onChange={(e) => onAccessTypeChange(e.target.value)}
              />
              Allow editing
            </label>
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-secondary" onClick={() => onGenerate(accessType)}>
            Generate share link
          </button>
          <button type="button" className="btn-primary" onClick={onCopy} disabled={!shareData?.shareUrl}>
            Copy link
          </button>
          <button type="button" className="btn-secondary" onClick={onDownloadQr} disabled={!shareData?.qrCode}>
            Download QR
          </button>
          {shareData?.accessLevel && (
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Access: {shareData.accessLevel}</span>
          )}
        </div>

        <div className="flex justify-center">
          {shareData?.qrCode ? (
            <img src={shareData.qrCode} alt="Travel plan share QR code" className="h-56 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-soft" />
          ) : (
            <div className="h-56 w-56 rounded-xl border border-dashed border-slate-300 bg-slate-50" />
          )}
        </div>

        <div className="break-all rounded-lg bg-slate-50 px-3 py-2 text-center text-sm text-slate-700">
          {shareData?.shareUrl || 'Share link unavailable.'}
        </div>

        {shareMessage && <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">{shareMessage}</div>}
      </div>
    </div>
  );
}
