import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as expenseApi from '../api/expenseApi';
import * as travelApi from '../api/travelApi';
import ActivitiesSection from '../components/ActivitiesSection.jsx';
import ChecklistSection from '../components/ChecklistSection.jsx';
import DestinationsSection from '../components/DestinationsSection.jsx';
import ExpensesSection from '../components/ExpensesSection.jsx';
import ShareSection from '../components/ShareSection.jsx';
import TripSummaryForm from '../components/TripSummaryForm.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import { toTravelPlan } from '../models/index.js';

export default function TravelDetailPage() {
  const { id } = useParams();
  const travelId = Number(id);
  const { notifySuccess, notifyError } = useNotifications();
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [shareMessage, setShareMessage] = useState('');
  const [shareAccessType, setShareAccessType] = useState('VIEW');

  const showError = (message) => {
    setError(message);
    notifyError(message);
  };

  const load = async () => {
    try {
      const data = await travelApi.getTravelPlan(travelId);
      setPlan(toTravelPlan(data));
      setError('');
    } catch {
      setPlan(null);
      setError('Trip not found or no access.');
    }
  };

  const loadShare = async () => {
    try {
      const data = await travelApi.getPlanShare(travelId);
      setShareData(data);
      setShareMessage('');
    } catch {
      setShareData(null);
    }
  };

  useEffect(() => {
    load();
    loadShare();
  }, [travelId]);

  const remaining = useMemo(() => {
    if (!plan) return 0;
    return Number(plan.budget) - Number(plan.totalExpenses);
  }, [plan]);

  const runMutation = async (action, successMessage) => {
    try {
      setError('');
      await action();
      await load();
      notifySuccess(successMessage);
    } catch (err) {
      const message = err.response?.data?.message || 'Action failed.';
      setError(message);
    }
  };

  const savePlan = (payload) =>
    runMutation(() => travelApi.updateTravelPlan(travelId, payload), 'Trip updated successfully.');

  const addDestination = (payload) =>
    runMutation(() => travelApi.addDestination(travelId, payload), 'Destination added successfully.');

  const updateDestination = (destinationId, payload) =>
    runMutation(() => travelApi.updateDestination(destinationId, payload), 'Destination updated successfully.');

  const removeDestination = (destinationId) =>
    runMutation(() => travelApi.removeDestination(destinationId), 'Destination removed successfully.');

  const addActivity = (payload) => runMutation(() => travelApi.addActivity(travelId, payload), 'Activity added successfully.');

  const updateActivity = (activityId, payload) =>
    runMutation(() => travelApi.updateActivity(activityId, payload), 'Activity updated successfully.');

  const removeActivity = (activityId) => runMutation(() => travelApi.removeActivity(activityId), 'Activity removed successfully.');

  const addExpense = (payload) => runMutation(() => expenseApi.addExpense(travelId, payload), 'Expense added successfully.');

  const removeExpense = (expenseId) =>
    runMutation(() => expenseApi.deleteExpense(travelId, expenseId), 'Expense removed successfully.');

  const addChecklistItem = (payload) =>
    runMutation(() => travelApi.addChecklistItem(travelId, payload), 'Checklist item added successfully.');

  const updateChecklistItem = (itemId, isDone) =>
    runMutation(() => travelApi.updateChecklistItem(itemId, { isDone }), 'Checklist item updated successfully.');

  const removeChecklistItem = (itemId) =>
    runMutation(() => travelApi.removeChecklistItem(itemId), 'Checklist item removed successfully.');

  const generateShare = async (accessType) => {
    try {
      setError('');
      const data = await travelApi.createShare(travelId, accessType);
      setShareData(data);
      setShareMessage(`${data.accessLevel} share link generated.`);
      notifySuccess(`${data.accessLevel} share link generated.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate share link.');
    }
  };

  const copyShareLink = async () => {
    if (!shareData?.shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareData.shareUrl);
      setShareMessage('Share link copied to clipboard.');
      notifySuccess('Share link copied to clipboard.');
    } catch {
      showError('Could not copy share link.');
    }
  };

  const downloadQrCode = () => {
    if (!shareData?.qrCode) return;
    const a = document.createElement('a');
    a.href = shareData.qrCode;
    a.download = `travel-plan-${travelId}-qr.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    notifySuccess('QR code download started.');
  };

  const downloadPdf = async () => {
    try {
      setIsPdfLoading(true);
      const { blob, fileName } = await travelApi.downloadTravelPlanPdf(travelId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || `travel-plan-${travelId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      notifySuccess('PDF download started.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate PDF report.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  if (!plan && !error) {
    return (
      <div className="flex items-center gap-3 text-slate-600">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
        Loading trip…
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="surface max-w-lg">
        <p className="text-rose-700">{error}</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-teal-700 hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to="/" className="text-sm font-semibold text-teal-700 hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{plan.title}</h1>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}

      <TripSummaryForm
        plan={plan}
        remaining={remaining}
        onSave={savePlan}
        onDownloadPdf={downloadPdf}
        isPdfLoading={isPdfLoading}
        onValidationError={showError}
      />

      <ShareSection
        shareData={shareData}
        shareMessage={shareMessage}
        accessType={shareAccessType}
        onAccessTypeChange={setShareAccessType}
        onGenerate={generateShare}
        onCopy={copyShareLink}
        onDownloadQr={downloadQrCode}
      />

      <DestinationsSection
        destinations={plan.destinations}
        onAdd={addDestination}
        onUpdate={updateDestination}
        onRemove={removeDestination}
        onValidationError={showError}
      />

      <ActivitiesSection
        activities={plan.activities}
        onAdd={addActivity}
        onUpdate={updateActivity}
        onRemove={removeActivity}
        onValidationError={showError}
      />

      <ExpensesSection expenses={plan.expenses} onAdd={addExpense} onRemove={removeExpense} onValidationError={showError} />

      <ChecklistSection
        items={plan.checklist}
        onAdd={addChecklistItem}
        onToggle={updateChecklistItem}
        onRemove={removeChecklistItem}
      />
    </div>
  );
}
