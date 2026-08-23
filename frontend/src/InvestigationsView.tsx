import { useState } from 'react';
import InvestigationsList from './InvestigationsList';
import InvestigationDetail from './InvestigationDetail';

export default function InvestigationsView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (selectedId) {
    return <InvestigationDetail id={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return <InvestigationsList onSelect={setSelectedId} />;
}
