'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import DataTable from '@/components/admin/tables/DataTable';
import StatusBadge from '@/components/admin/tables/StatusBadge';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { HelpCircle, MessageSquare, Send, RefreshCw, User, CheckCircle2, Clock, Headphones, ListChecks } from 'lucide-react';

export default function SupportOperationsPage() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'tickets'
  const [loading, setLoading] = useState(true);

  // Chat State
  const [chatThreads, setChatThreads] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const chatBottomRef = useRef(null);

  // Tickets State
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchChatThreads();
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserChatMessages(selectedUser.userId);
    }
  }, [selectedUser]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchChatThreads = async () => {
    try {
      const res = await apiFetch('/admin/support/chat');
      if (res.success && res.data) {
        setChatThreads(res.data);
        if (!selectedUser && res.data.length > 0) {
          setSelectedUser(res.data[0]);
        }
      }
    } catch (e) {
      console.error('Fetch chat threads error:', e);
    }
  };

  const fetchUserChatMessages = async (userId) => {
    try {
      setLoading(true);
      const res = await apiFetch(`/admin/support/chat?userId=${userId}`);
      if (res.success && res.data) {
        setChatMessages(res.data);
      }
    } catch (e) {
      console.error('Fetch user chat error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await apiFetch('/admin/support');
      if (res.status && res.data) {
        setTickets(res.data);
      }
    } catch (e) {
      console.error('Fetch tickets error:', e);
    }
  };

  const handleSendAdminReply = async (e) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedUser) return;

    setSendingReply(true);
    try {
      const res = await apiFetch('/admin/support/chat', 'POST', {
        userId: selectedUser.userId,
        text: adminReplyText.trim()
      });

      if (res.success) {
        setChatMessages(prev => [...prev, res.data]);
        setAdminReplyText('');
        fetchChatThreads();
      }
    } catch (err) {
      Swal.fire({ title: 'Send Error', text: err.message || 'Failed to send message', icon: 'error', background: '#111624', color: '#ffffff' });
    } finally {
      setSendingReply(false);
    }
  };

  const handleResolveTicket = (ticketId) => {
    Swal.fire({
      title: 'Resolve Ticket?',
      input: 'textarea',
      inputPlaceholder: 'Enter resolution notes...',
      showCancelButton: true,
      confirmButtonText: 'Resolve & Close',
      confirmButtonColor: 'var(--emerald)',
      background: '#111624',
      color: '#ffffff'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await apiFetch(`/admin/support/${ticketId}/resolve`, 'POST', { notes: res.value });
          setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: 'Resolved' } : t));
          Swal.fire({ title: 'Resolved', text: `Ticket marked as RESOLVED`, icon: 'success', background: '#111624', color: '#ffffff' });
        } catch (e) {}
      }
    });
  };

  const totalUnreadMessages = chatThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);

  const ticketColumns = [
    {
      key: 'id',
      label: 'Ticket ID',
      render: (v) => <strong style={{ color: 'var(--emerald-light)', fontFamily: 'monospace' }}>{v}</strong>
    },
    {
      key: 'user',
      label: 'Player Account',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong style={{ color: '#ffffff' }}>{v}</strong>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.mobile}</span>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (v) => <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v}</span>
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (v) => <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{v}</span>
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (v) => <StatusBadge status={v === 'HIGH' ? 'HIGH' : 'MEDIUM'} />
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge status={v} />
    },
    {
      key: 'action',
      label: 'Action',
      align: 'right',
      render: (_, r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {r.status !== 'Resolved' && (
            <button
              onClick={() => handleResolveTicket(r.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'var(--emerald)',
                color: '#000000',
                fontWeight: 900,
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Resolve Ticket
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label">PLAYER SUPPORT & LIVE OPERATIONS</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.03em' }}>
              <Headphones size={26} color="var(--emerald-light)" /> Customer Support & Live Chat
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => { fetchChatThreads(); fetchTickets(); }}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={15} /> Refresh Feed
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Active Chat Threads" value={chatThreads.length} trend="Total conversations" trendType="neutral" icon={MessageSquare} badgeColor="emerald" />
          <StatCard title="Unread Player Messages" value={totalUnreadMessages} trend="Requires response" trendType={totalUnreadMessages > 0 ? 'down' : 'up'} icon={Clock} badgeColor={totalUnreadMessages > 0 ? 'rose' : 'emerald'} />
          <StatCard title="Open Support Tickets" value={tickets.filter(t => t.status === 'Open').length} trend="In queue" trendType="neutral" icon={HelpCircle} badgeColor="gold" />
          <StatCard title="Resolved Tickets" value={tickets.filter(t => t.status === 'Resolved').length} trend="Closed cases" trendType="up" icon={CheckCircle2} badgeColor="emerald" />
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: activeTab === 'chat' ? 'var(--emerald)' : 'transparent',
              color: activeTab === 'chat' ? '#000000' : 'var(--text-secondary)',
              fontWeight: 900,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <MessageSquare size={16} /> Live Player Chat Console
            {totalUnreadMessages > 0 && (
              <span style={{ backgroundColor: '#f43f5e', color: '#ffffff', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
                {totalUnreadMessages}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: activeTab === 'tickets' ? 'var(--emerald)' : 'transparent',
              color: activeTab === 'tickets' ? '#000000' : 'var(--text-secondary)',
              fontWeight: 900,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ListChecks size={16} /> Helpdesk Tickets Queue ({tickets.length})
          </button>
        </div>

        {/* TAB 1: LIVE PLAYER CHAT CONSOLE */}
        {activeTab === 'chat' && (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem', height: '620px' }}>
            {/* Left Column: Player Conversation Threads */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '1rem', overflow: 'hidden' }}>
              <div className="micro-label" style={{ marginBottom: '0.75rem' }}>CONVERSATIONS ({chatThreads.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1 }}>
                {chatThreads.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 1rem', fontSize: '0.85rem' }}>
                    No player support chat messages yet.
                  </div>
                ) : (
                  chatThreads.map((thread) => {
                    const isSelected = selectedUser?.userId === thread.userId;
                    return (
                      <div
                        key={thread.userId}
                        onClick={() => setSelectedUser(thread)}
                        style={{
                          padding: '0.85rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isSelected ? 'var(--emerald-bg)' : 'var(--surface-2)',
                          border: isSelected ? '1px solid var(--emerald-light)' : '1px solid var(--border)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ color: isSelected ? 'var(--emerald-light)' : '#ffffff', fontSize: '0.85rem' }}>
                            {thread.username}
                          </strong>
                          {thread.unreadCount > 0 && (
                            <span style={{ backgroundColor: '#f43f5e', color: '#ffffff', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 900 }}>
                              {thread.unreadCount} NEW
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {thread.lastMessage || 'No text'}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                          {thread.mobile} • {thread.lastTimestamp ? new Date(thread.lastTimestamp).toLocaleTimeString() : ''}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Chat Dialogue View */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem', overflow: 'hidden' }}>
              {selectedUser ? (
                <>
                  {/* Chat Top Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--emerald-bg)', border: '1px solid var(--emerald-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald-light)', fontWeight: 800 }}>
                        {selectedUser.username?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div>
                        <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{selectedUser.username}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mobile: {selectedUser.mobile} • User ID: {selectedUser.userId}</div>
                      </div>
                    </div>
                  </div>

                  {/* Message Bubble Feed */}
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
                    {chatMessages.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto', fontSize: '0.85rem' }}>
                        No message history with this player.
                      </div>
                    ) : (
                      chatMessages.map((msg, idx) => {
                        const isAdmin = msg.senderRole === 'ADMIN';
                        return (
                          <div
                            key={msg._id || idx}
                            style={{
                              alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                              maxWidth: '70%',
                              padding: '0.75rem 1rem',
                              borderRadius: isAdmin ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                              backgroundColor: isAdmin ? 'var(--emerald)' : 'var(--surface-2)',
                              color: isAdmin ? '#000000' : '#ffffff',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                              border: isAdmin ? 'none' : '1px solid var(--border)'
                            }}
                          >
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.8, marginBottom: '0.2rem' }}>
                              {isAdmin ? '🛡️ ROYAL LUDO SUPPORT' : `👤 ${selectedUser.username}`}
                            </div>
                            <div style={{ fontSize: '0.875rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                              {msg.text}
                            </div>
                            <div style={{ fontSize: '0.65rem', textAlign: 'right', marginTop: '0.35rem', opacity: 0.7 }}>
                              {new Date(msg.timestamp || msg.createdAt || Date.now()).toLocaleTimeString()}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Send Admin Message Form */}
                  <form onSubmit={handleSendAdminReply} style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                    <input
                      type="text"
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      placeholder={`Reply to ${selectedUser.username}... (Max 500 chars)`}
                      maxLength={500}
                      className="custom-input"
                      style={{ flex: 1 }}
                      disabled={sendingReply}
                      required
                    />
                    <button
                      type="submit"
                      disabled={sendingReply || !adminReplyText.trim()}
                      style={{
                        padding: '0.6rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--emerald)',
                        color: '#000000',
                        fontWeight: 900,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 0 15px var(--emerald-glow)'
                      }}
                    >
                      <Send size={16} /> {sendingReply ? 'Sending...' : 'Send Reply'}
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <MessageSquare size={42} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
                  <div style={{ fontSize: '1rem', fontWeight: 800 }}>No Player Selected</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Select a conversation on the left to start live chat.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: HELPDESK TICKETS QUEUE */}
        {activeTab === 'tickets' && (
          <DataTable
            columns={ticketColumns}
            data={tickets}
            loading={loading}
            emptyTitle="No Support Tickets"
            emptyDescription="No helpdesk tickets recorded in MongoDB."
          />
        )}
      </div>
    </AppShell>
  );
}
