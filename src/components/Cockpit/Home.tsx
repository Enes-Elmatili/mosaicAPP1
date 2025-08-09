import React from 'react';

/**
 * Cockpit Dashboard displaying KPIs
 */
export default function CockpitHome() {
  const [auditResult, setAuditResult] = React.useState<string | null>(null);
  const [runningAudit, setRunningAudit] = React.useState(false);

  const runAudit = async () => {
    setRunningAudit(true);
    setAuditResult(null);
    try {
      const res = await import('../../ai-sandbox').then(m =>
        m.runSandboxTask('generateCode', { prompt: 'audit code for vulnerabilities' })
      );
      if (res.success) setAuditResult(res.code);
      else setAuditResult(`Erreur audit IA: ${res.message}`);
    } catch (e: any) {
      setAuditResult(`Erreur IA: ${e.message}`);
    } finally {
      setRunningAudit(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Cockpit Dashboard</h2>
        <button
          onClick={runAudit}
          disabled={runningAudit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {runningAudit ? 'Audit en cours…' : 'Lancer AI Audit'}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Utilisateurs actifs</h3>
          <p className="text-3xl font-semibold">1234</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Demandes API</h3>
          <p className="text-3xl font-semibold">5678</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Tests réussis</h3>
          <p className="text-3xl font-semibold">99%</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Erreurs critiques</h3>
          <p className="text-3xl font-semibold text-red-600">2</p>
        </div>
      </div>
      {auditResult && (
        <div className="bg-gray-100 p-4 rounded shadow">
          <h4 className="font-medium mb-2">Résultat AI Audit</h4>
          <pre className="whitespace-pre-wrap text-sm text-gray-800">{auditResult}</pre>
        </div>
      )}
    </div>
  );
}
