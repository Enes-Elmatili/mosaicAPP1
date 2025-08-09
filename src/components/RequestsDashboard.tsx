import React, { useEffect, useState } from 'react';

/**
 * Stub component to fetch and display maintenance requests filtered by status,
 * and render a simple status timeline for a selected request.
 */
import socket from '../utils/socketClient';

export function RequestsDashboard({ statusFilter }: { statusFilter: string }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  // Fetch requests by status
  useEffect(() => {
    fetch(`/api/requests?status=${statusFilter}`)
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(console.error);
  }, [statusFilter]);

  // Fetch history for the first request (as example)
  useEffect(() => {
    if (requests.length > 0) {
      const id = requests[0].id;
      fetch(`/api/requests/${id}/status-history`)
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(console.error);
    }
  }, [requests]);

  // Listen to real-time status updates via Socket.io
  useEffect(() => {
    socket.on('status_updated', ({ requestId, status, timestamp }) => {
      if (requests.some(r => r.id === requestId)) {
        setRequests(rs => rs.map(r => r.id === requestId ? { ...r, status } : r));
        setHistory(hs => [...hs, { id: hs.length + 1, status, timestamp }]);
      }
    });
    return () => { socket.off('status_updated'); };
  }, [requests]);

  return (
    <div>
      <h2>Requests ({statusFilter})</h2>
      <ul>
        {requests.map(req => (
          <li key={req.id}>{req.serviceType} - {req.status}</li>
        ))}
      </ul>
      <h3>Status Timeline</h3>
      <ol>
        {history.map(h => (
          <li key={h.id}>{h.status} @ {new Date(h.timestamp).toLocaleString()}</li>
        ))}
      </ol>
    </div>
  );
}
