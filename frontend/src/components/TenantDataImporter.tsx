import { useState } from 'react';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import { completeTenantsData } from '../data/completeTenantsData';

const apiUrl = import.meta.env.VITE_API_URL || '';

interface TenantDataImporterProps {
  onImportComplete: () => void;
}

const TenantDataImporter = ({ onImportComplete }: TenantDataImporterProps) => {
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Complete tenant data from the provided SQL INSERT - now imported from utils
  const tenantData = completeTenantsData;

  const handleImport = async () => {
    setImporting(true);
    setImportStatus('idle');

    try {
      const response = await fetch(`${apiUrl}/api/tenants/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tenantsData: tenantData }),
      });

      if (response.ok) {
        setImportStatus('success');
        setTimeout(() => {
          onImportComplete();
        }, 1500);
      } else {
        setImportStatus('error');
      }
    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus('error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="bg-dark-900 border border-golden-600/20 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-golden-400 mb-1">Import Your Complete Data</h3>
          <p className="text-golden-300 text-sm">
            Import ALL your tenant data - Complete database with {tenantData.length} tenant records
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {importStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">Import successful!</span>
            </div>
          )}
          
          {importStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-400">
              <XCircle className="h-5 w-5" />
              <span className="text-sm">Import failed</span>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={importing || importStatus === 'success'}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-golden-500 to-golden-600 text-dark-900 rounded-lg hover:from-golden-600 hover:to-golden-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="h-4 w-4" />
            {importing ? 'Importing...' : importStatus === 'success' ? 'Updated!' : 'Import All Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantDataImporter; 