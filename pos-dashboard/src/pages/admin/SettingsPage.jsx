import { useState } from 'react';
import { Settings, Store, Receipt, Percent, Clock, Save, RefreshCw, Upload, Image } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings.js';
import {
  PageHeader, Btn, LoadingSpinner, ErrorState, Field, Input, Select, Textarea, useToast, Toast
} from '../../components/ui/index.jsx';

const DARK_GREEN = '#343e2c';

export default function SettingsPage() {
  const { settings, loading, error, refresh, saveSettings } = useSettings();
  const { toast, show } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    const formData = Object.fromEntries(new FormData(e.target));
    formData.taxInclusive = e.target.taxInclusive.checked;
    try {
      await saveSettings(formData); show('success', 'Settings updated');
    } catch (err) { show('error', err.message); }
    finally { setIsSubmitting(false); }
  };

  if (loading) return <LoadingSpinner text="Connecting to core system..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <div className="flex flex-col min-h-full">
      <Toast message={toast} />
      <PageHeader 
        title="System Settings" 
        subtitle="Configure your cafe profile, tax, and receipts" 
        icon={<Settings size={18} />} 
        action={<Btn onClick={refresh} variant="secondary" size="sm"><RefreshCw size={14} /> Reload</Btn>}
      />

      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cafe Profile */}
          <div className="bg-white rounded-2xl border border-sage-100 shadow-sm overflow-hidden flex flex-col">
             <div className="px-5 py-4 border-b border-sage-50 bg-sage-50/10 flex items-center gap-2">
                <Store size={16} className="text-sage-500" />
                <h2 className="text-sm font-bold text-sage-900">Cafe Profile</h2>
             </div>
             <div className="p-5 space-y-4 flex-1">
                <Field label="Cafe Name" required><Input name="cafeName" defaultValue={settings?.cafeName} placeholder="Green Grounds Cafe" required /></Field>
                <Field label="Address"><Textarea name="address" defaultValue={settings?.address} placeholder="123 Street, City, Country" /></Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Phone Number"><Input name="phone" defaultValue={settings?.phone} placeholder="+213..." /></Field>
                  <Field label="Currency"><Select name="currency" defaultValue={settings?.currency || 'DZD'}><option value="DZD">DZD (Algerian Dinar)</option><option value="USD">USD (US Dollar)</option><option value="EUR">EUR (Euro)</option></Select></Field>
                </div>
                <Field label="Store Logo URL"><div className="flex gap-2 items-center"><Input name="logo" defaultValue={settings?.logo} placeholder="https://..." className="flex-1" /><div className="w-10 h-10 rounded-xl bg-sage-50 border border-sage-100 flex items-center justify-center flex-shrink-0">{settings?.logo ? <img src={settings.logo} className="w-8 h-8 object-contain" /> : <Image size={14} className="text-sage-300" />}</div></div></Field>
             </div>
          </div>

          {/* Tax & Financials */}
          <div className="bg-white rounded-2xl border border-sage-100 shadow-sm overflow-hidden flex flex-col">
             <div className="px-5 py-4 border-b border-sage-50 bg-sage-50/10 flex items-center gap-2">
                <Percent size={16} className="text-sage-500" />
                <h2 className="text-sm font-bold text-sage-900">Tax & Localities</h2>
             </div>
             <div className="p-5 space-y-4 flex-1">
                <Field label="Sales Tax Rate (%)" required><Input name="taxRate" type="number" step="0.01" defaultValue={settings?.taxRate || 19} required /></Field>
                <div className="flex items-center gap-3 bg-sage-50/50 p-4 rounded-xl border border-sage-100">
                   <input type="checkbox" id="taxInclusive" name="taxInclusive" defaultChecked={settings?.taxInclusive} className="w-4 h-4 accent-sage-800 rounded" />
                   <label htmlFor="taxInclusive" className="text-xs font-bold text-sage-700 cursor-pointer">Prices are tax-inclusive</label>
                </div>
                <div className="text-[10px] text-sage-400 bg-sage-50 p-3 rounded-xl italic">
                   Note: Taxes are automatically applied to orders during checkout in the POS terminal.
                </div>
             </div>
          </div>

          {/* Receipt Customization */}
          <div className="bg-white rounded-2xl border border-sage-100 shadow-sm overflow-hidden flex flex-col">
             <div className="px-5 py-4 border-b border-sage-50 bg-sage-50/10 flex items-center gap-2">
                <Receipt size={16} className="text-sage-500" />
                <h2 className="text-sm font-bold text-sage-900">Receipt Design</h2>
             </div>
             <div className="p-5 space-y-4 flex-1">
                <Field label="Header Message"><Textarea name="receiptHeader" defaultValue={settings?.receiptHeader} placeholder="Thank you for visiting Green Grounds!" /></Field>
                <Field label="Footer Message"><Textarea name="receiptFooter" defaultValue={settings?.receiptFooter} placeholder="Connect with us on social media @greengrounds" /></Field>
                <Btn variant="secondary" size="sm" className="w-full">Preview Sample Receipt</Btn>
             </div>
          </div>

          {/* Operational Hours (text format for now) */}
          <div className="bg-white rounded-2xl border border-sage-100 shadow-sm overflow-hidden flex flex-col">
             <div className="px-5 py-4 border-b border-sage-50 bg-sage-50/10 flex items-center gap-2">
                <Clock size={16} className="text-sage-500" />
                <h2 className="text-sm font-bold text-sage-900">Working Hours</h2>
             </div>
             <div className="p-5 space-y-4 flex-1">
                <Field label="Operational Hours Summary"><Textarea name="openingHours" defaultValue={settings?.openingHours} placeholder="Mon-Fri: 7 AM - 10 PM&#10;Sat-Sun: 7 AM - 11 PM" rows={5}/></Field>
                <div className="text-[10px] text-sage-400 p-2 italic">Used for store profile in customer-facing apps.</div>
             </div>
          </div>

          {/* Save Action */}
          <div className="lg:col-span-2 flex justify-end gap-3 pb-10">
             <Btn variant="secondary" type="reset">Discard Changes</Btn>
             <Btn type="submit" disabled={isSubmitting} className="min-w-[140px] flex items-center justify-center">
                {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} Save Configuration
             </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
