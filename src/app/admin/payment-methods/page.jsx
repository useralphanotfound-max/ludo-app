'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import {
  QrCode,
  CreditCard,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Upload,
  ArrowDownLeft,
  X,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

export default function PaymentMethodsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [methods, setMethods] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, qrCount: 0, upiCount: 0 });
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    type: 'UPI',
    upiId: '',
    payeeName: 'Royal Ludo Gaming',
    qrImageUrl: '',
    minAmount: 50,
    maxAmount: 50000,
    instructions: 'Pay via any UPI application and submit the 12-digit UTR number.',
    isActive: true,
    sortOrder: 1
  });
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Lightbox preview modal
  const [lightboxQr, setLightboxQr] = useState(null);

  useEffect(() => {
    fetchMethods();
  }, [typeFilter]);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const url = typeFilter === 'ALL' 
        ? '/admin/payment-methods' 
        : `/admin/payment-methods?type=${typeFilter}`;
      const res = await apiFetch(url);
      if (res.status && res.data) {
        setMethods(res.data);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAddModal = () => {
    setEditingMethod(null);
    setFormData({
      name: `UPI Method ${methods.length + 1}`,
      type: 'UPI',
      upiId: 'royalludo@upi',
      payeeName: 'Royal Ludo Gaming',
      qrImageUrl: '',
      minAmount: 50,
      maxAmount: 50000,
      instructions: 'Pay via any UPI app and enter the 12-digit UTR number.',
      isActive: true,
      sortOrder: methods.length + 1
    });
    setQrFile(null);
    setQrPreview(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (method) => {
    setEditingMethod(method);
    setFormData({
      name: method.name || '',
      type: method.type || 'UPI',
      upiId: method.upiId || '',
      payeeName: method.payeeName || 'Royal Ludo Gaming',
      qrImageUrl: method.qrImageUrl || '',
      minAmount: method.minAmount || 50,
      maxAmount: method.maxAmount || 50000,
      instructions: method.instructions || '',
      isActive: method.isActive !== undefined ? method.isActive : true,
      sortOrder: method.sortOrder || 1
    });
    setQrFile(null);
    setQrPreview(method.qrImageUrl || null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      Swal.fire({ title: 'Validation Error', text: 'Method Name is required', icon: 'warning', background: '#111624', color: '#ffffff' });
      return;
    }
    if (formData.type === 'UPI' && !formData.upiId.trim()) {
      Swal.fire({ title: 'Validation Error', text: 'UPI ID is required for UPI method', icon: 'warning', background: '#111624', color: '#ffffff' });
      return;
    }

    try {
      setSubmitting(true);
      const token = typeof window !== 'undefined' ? (localStorage.getItem('royal_admin_token') || localStorage.getItem('token')) : '';

      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('type', formData.type);
      submitData.append('upiId', formData.upiId.trim());
      submitData.append('payeeName', formData.payeeName.trim());
      submitData.append('minAmount', formData.minAmount);
      submitData.append('maxAmount', formData.maxAmount);
      submitData.append('instructions', formData.instructions);
      submitData.append('isActive', formData.isActive ? 'true' : 'false');
      submitData.append('sortOrder', formData.sortOrder);

      if (qrFile) {
        submitData.append('qr_image', qrFile);
      } else if (formData.qrImageUrl) {
        submitData.append('qrImageUrl', formData.qrImageUrl);
      }

      const url = editingMethod 
        ? `/api/admin/payment-methods/${editingMethod.id || editingMethod._id}` 
        : '/api/admin/payment-methods';
      
      const method = editingMethod ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: submitData
      });

      const data = await res.json();
      if (data.status || data.success) {
        Swal.fire({
          title: editingMethod ? 'Method Updated!' : 'Method Added!',
          text: data.message || 'Payment method saved successfully.',
          icon: 'success',
          background: '#111624',
          color: '#ffffff',
          timer: 1800
        });
        setIsModalOpen(false);
        fetchMethods();
      } else {
        Swal.fire({
          title: 'Error Saving',
          text: data.error?.message || data.message || 'Failed to save payment method',
          icon: 'error',
          background: '#111624',
          color: '#ffffff'
        });
      }
    } catch (err) {
      console.error('Submit error:', err);
      Swal.fire({ title: 'Network Error', text: err.message, icon: 'error', background: '#111624', color: '#ffffff' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (method) => {
    try {
      const newStatus = !method.isActive;
      const res = await apiFetch(`/admin/payment-methods/${method.id || method._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: newStatus })
      });

      if (res.status || res.success) {
        setMethods(prev => prev.map(m => (m.id === method.id ? { ...m, isActive: newStatus } : m)));
        setSummary(prev => ({
          ...prev,
          active: newStatus ? prev.active + 1 : Math.max(0, prev.active - 1)
        }));
      }
    } catch (err) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error', background: '#111624', color: '#ffffff' });
    }
  };

  const handleDelete = async (method) => {
    const confirm = await Swal.fire({
      title: 'Delete Payment Method?',
      text: `Are you sure you want to delete "${method.name}"? Users will no longer see this method in the deposit modal.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Delete',
      background: '#111624',
      color: '#ffffff'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await apiFetch(`/admin/payment-methods/${method.id || method._id}`, {
        method: 'DELETE'
      });

      if (res.status || res.success) {
        Swal.fire({ title: 'Deleted', text: 'Method removed.', icon: 'success', background: '#111624', color: '#ffffff', timer: 1500 });
        fetchMethods();
      }
    } catch (err) {
      Swal.fire({ title: 'Delete Failed', text: err.message, icon: 'error', background: '#111624', color: '#ffffff' });
    }
  };

  const filteredMethods = methods.filter(m => {
    if (typeFilter === 'ALL') return true;
    if (typeFilter === 'ACTIVE') return m.isActive;
    return m.type === typeFilter;
  });

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Header & Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--emerald-light)' }}>
              <Layers size={13} /> DEPOSIT & QR CODE MANAGEMENT
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', letterSpacing: '-0.03em' }}>
              Deposit Payment Methods & QR Codes
            </h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Add and manage multiple UPI IDs and QR code images shown to players in the mobile app for wallet deposits.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={fetchMethods}
              style={{
                padding: '0.65rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={15} /> Refresh
            </button>

            <button
              onClick={handleOpenAddModal}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--emerald)',
                color: '#000000',
                fontWeight: 800,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              <Plus size={17} /> Add Payment Method
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard
            title="Total Configured Methods"
            value={summary.total || methods.length}
            trend="Active in App"
            trendType="up"
            icon={Layers}
            badgeColor="emerald"
          />
          <StatCard
            title="Active QR Code Methods"
            value={summary.qrCount || methods.filter(m => m.type === 'QR_CODE').length}
            trend="Scan & Pay Ready"
            trendType="up"
            icon={QrCode}
            badgeColor="gold"
          />
          <StatCard
            title="Active UPI Handles"
            value={summary.upiCount || methods.filter(m => m.type === 'UPI').length}
            trend="Direct UPI Transfer"
            trendType="up"
            icon={CreditCard}
            badgeColor="cyan"
          />
          <StatCard
            title="Enabled Live Status"
            value={`${summary.active || methods.filter(m => m.isActive).length} / ${methods.length}`}
            trend="Available to Players"
            trendType="neutral"
            icon={CheckCircle}
            badgeColor="emerald"
          />
        </div>

        {/* Filter Tabs */}
        <div className="glass-panel" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Methods', icon: Layers },
              { id: 'UPI', label: 'UPI Direct', icon: CreditCard },
              { id: 'QR_CODE', label: 'QR Codes', icon: QrCode },
              { id: 'ACTIVE', label: 'Active Only', icon: CheckCircle }
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = typeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTypeFilter(tab.id)}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: isActive ? '1px solid var(--emerald)' : '1px solid rgba(255,255,255,0.06)',
                    backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    color: isActive ? 'var(--emerald-light)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer'
                  }}
                >
                  <TabIcon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredMethods.length}</strong> configured deposit gateway options
          </div>
        </div>

        {/* Methods Grid */}
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
            <p>Loading payment methods & QR codes...</p>
          </div>
        ) : filteredMethods.length === 0 ? (
          <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <QrCode size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>No Payment Methods Found</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              Add your first UPI handle or QR code method so players can easily scan or copy details to deposit money into Royal Ludo.
            </p>
            <button
              onClick={handleOpenAddModal}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--emerald)',
                color: '#000000',
                fontWeight: 800,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Plus size={16} /> Add First Method
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.25rem' }}>
            {filteredMethods.map((method, idx) => {
              const isQr = method.type === 'QR_CODE';
              const qrSrc = method.qrImageUrl || (method.upiId ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(method.upiId)}&pn=${encodeURIComponent(method.payeeName)}&cu=INR` : '');

              return (
                <div
                  key={method.id || method._id}
                  className="glass-panel"
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: method.isActive ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(244, 63, 94, 0.2)',
                    background: method.isActive 
                      ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.04) 0%, rgba(13, 17, 29, 0.8) 100%)' 
                      : 'linear-gradient(180deg, rgba(244, 63, 94, 0.04) 0%, rgba(13, 17, 29, 0.8) 100%)',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Top Bar: Badges & Status Switch */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            backgroundColor: isQr ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: isQr ? 'var(--gold)' : 'var(--emerald-light)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          {isQr ? <QrCode size={12} /> : <CreditCard size={12} />}
                          {method.type}
                        </span>

                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                          #{method.sortOrder || idx + 1}
                        </span>
                      </div>

                      {/* Active / Inactive Switch */}
                      <button
                        onClick={() => handleToggleStatus(method)}
                        title={method.isActive ? 'Click to Disable' : 'Click to Enable'}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: method.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                          color: method.isActive ? 'var(--emerald-light)' : 'var(--rose)',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}
                      >
                        {method.isActive ? <CheckCircle size={13} /> : <XCircle size={13} />}
                        {method.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </div>

                    {/* Method Title */}
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                      {method.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Payee: <strong style={{ color: '#e2e8f0' }}>{method.payeeName || 'Royal Ludo Gaming'}</strong>
                    </div>

                    {/* QR Code or UPI Handle Card Box */}
                    <div
                      style={{
                        backgroundColor: '#070a13',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        padding: '1rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      {/* If QR Code Available */}
                      {qrSrc && (
                        <div style={{ position: 'relative', textAlign: 'center' }}>
                          <div
                            onClick={() => setLightboxQr({ src: qrSrc, name: method.name, upiId: method.upiId, payeeName: method.payeeName })}
                            style={{
                              width: '120px',
                              height: '120px',
                              backgroundColor: '#ffffff',
                              padding: '6px',
                              borderRadius: '12px',
                              cursor: 'zoom-in',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                              margin: '0 auto',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'transform 0.2s ease'
                            }}
                            className="hover:scale-105"
                          >
                            <img
                              src={qrSrc}
                              alt={method.name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </div>
                          <button
                            onClick={() => setLightboxQr({ src: qrSrc, name: method.name, upiId: method.upiId, payeeName: method.payeeName })}
                            style={{
                              position: 'absolute',
                              bottom: '-6px',
                              right: 'calc(50% - 46px)',
                              backgroundColor: 'rgba(0,0,0,0.85)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              color: '#ffffff',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '999px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <Eye size={10} /> Enlarge QR
                          </button>
                        </div>
                      )}

                      {/* UPI ID Pill with Copy Button */}
                      {method.upiId && (
                        <div
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.45rem 0.65rem'
                          }}
                        >
                          <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 800, color: 'var(--gold)' }}>
                            {method.upiId}
                          </span>
                          <button
                            onClick={() => copyToClipboard(method.upiId, method.id || method._id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: copiedId === (method.id || method._id) ? 'var(--emerald-light)' : 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 700
                            }}
                          >
                            {copiedId === (method.id || method._id) ? <Check size={13} /> : <Copy size={13} />}
                            {copiedId === (method.id || method._id) ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Limits & Instruction */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                      <span>Limits:</span>
                      <strong style={{ color: '#ffffff' }}>₹{method.minAmount || 50} – ₹{(method.maxAmount || 50000).toLocaleString('en-IN')}</strong>
                    </div>

                    {method.instructions && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.3', margin: '0 0 1rem 0' }}>
                        {method.instructions}
                      </p>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                    <button
                      onClick={() => handleOpenEditModal(method)}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--surface-1)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Edit size={13} /> Edit Method
                    </button>

                    <button
                      onClick={() => handleDelete(method)}
                      style={{
                        padding: '0.45rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.25)',
                        color: 'var(--rose)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Delete Method"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ADD / EDIT MODAL */}
        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(4, 7, 18, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <div
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '560px',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: '#0c0f1e',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
                overflow: 'hidden'
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#090c17'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                    {editingMethod ? 'Edit Payment Method' : 'Add New Payment / QR Method'}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Configure the gateway details that will appear on players' deposit screen.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '75vh', overflowY: 'auto' }}>
                {/* Method Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Method Title / Display Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. UPI Method 1, PhonePe QR Code, Google Pay"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#070a13',
                      border: '1px solid var(--border)',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}
                    required
                  />
                </div>

                {/* Method Type Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Payment Type *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'UPI' })}
                      style={{
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-md)',
                        border: formData.type === 'UPI' ? '1px solid var(--emerald)' : '1px solid rgba(255,255,255,0.08)',
                        backgroundColor: formData.type === 'UPI' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                        color: formData.type === 'UPI' ? 'var(--emerald-light)' : 'var(--text-secondary)',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <CreditCard size={15} /> UPI Direct ID
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'QR_CODE' })}
                      style={{
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-md)',
                        border: formData.type === 'QR_CODE' ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
                        backgroundColor: formData.type === 'QR_CODE' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)',
                        color: formData.type === 'QR_CODE' ? 'var(--gold)' : 'var(--text-secondary)',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <QrCode size={15} /> QR Code Scan & Pay
                    </button>
                  </div>
                </div>

                {/* UPI ID */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Admin UPI ID {formData.type === 'UPI' ? '*' : '(Optional for QR)'}
                  </label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    placeholder="e.g. royalludo@upi or username@icici"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#070a13',
                      border: '1px solid var(--border)',
                      color: 'var(--gold)',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}
                    required={formData.type === 'UPI'}
                  />
                </div>

                {/* Payee Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Payee Account Name
                  </label>
                  <input
                    type="text"
                    value={formData.payeeName}
                    onChange={(e) => setFormData({ ...formData, payeeName: e.target.value })}
                    placeholder="e.g. Royal Ludo Gaming"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#070a13',
                      border: '1px solid var(--border)',
                      color: '#ffffff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                {/* QR Code Upload / Image */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    QR Code Image File {formData.type === 'QR_CODE' && '(Upload to /uploads/qr)'}
                  </label>

                  <div
                    style={{
                      border: '2px dashed rgba(255,255,255,0.15)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      textAlign: 'center',
                      backgroundColor: '#070a13',
                      cursor: 'pointer'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />

                    {qrPreview ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '110px', height: '110px', backgroundColor: '#ffffff', padding: '6px', borderRadius: '10px' }}>
                          <img src={qrPreview} alt="QR Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--emerald-light)', fontWeight: 700 }}>
                          ✓ Image Selected. Click to change.
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                        <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0' }}>
                          Click or drag QR image here
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          PNG, JPG, WEBP up to 5MB (Saves directly to server storage)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Min & Max Limits */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Min Deposit (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.minAmount}
                      onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#070a13',
                        border: '1px solid var(--border)',
                        color: '#ffffff',
                        fontSize: '0.85rem'
                      }}
                      min="10"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Max Deposit (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.maxAmount}
                      onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#070a13',
                        border: '1px solid var(--border)',
                        color: '#ffffff',
                        fontSize: '0.85rem'
                      }}
                      min="50"
                    />
                  </div>
                </div>

                {/* Instructions & Sort Order */}
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Player Instructions
                    </label>
                    <input
                      type="text"
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      placeholder="Instructions shown to user on payment screen"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#070a13',
                        border: '1px solid var(--border)',
                        color: '#ffffff',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#070a13',
                        border: '1px solid var(--border)',
                        color: '#ffffff',
                        fontSize: '0.85rem'
                      }}
                      min="1"
                    />
                  </div>
                </div>

                {/* Active Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--emerald)' }}
                  />
                  <label htmlFor="isActiveToggle" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', cursor: 'pointer' }}>
                    Enable this method immediately for player deposits
                  </label>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      flex: 2,
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--emerald)',
                      color: '#000000',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      opacity: submitting ? 0.6 : 1
                    }}
                  >
                    {submitting ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" /> Saving Method...
                      </>
                    ) : (
                      editingMethod ? 'Save Changes' : 'Create Payment Method'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* LIGHTBOX QR MODAL */}
        {lightboxQr && (
          <div
            onClick={() => setLightboxQr(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.9)',
              backdropFilter: 'blur(10px)',
              zIndex: 110,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              cursor: 'zoom-out'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="glass-panel"
              style={{
                maxWidth: '380px',
                width: '100%',
                backgroundColor: '#0c0f1e',
                borderRadius: '24px',
                padding: '2rem',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.25rem' }}>
                {lightboxQr.name}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                {lightboxQr.payeeName}
              </p>

              <div
                style={{
                  width: '240px',
                  height: '240px',
                  backgroundColor: '#ffffff',
                  padding: '12px',
                  borderRadius: '16px',
                  margin: '0 auto 1.25rem',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
                }}
              >
                <img src={lightboxQr.src} alt="Enlarged QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>

              {lightboxQr.upiId && (
                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    color: 'var(--gold)',
                    fontSize: '0.9rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{lightboxQr.upiId}</span>
                  <button
                    onClick={() => copyToClipboard(lightboxQr.upiId, 'lightbox')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copiedId === 'lightbox' ? 'var(--emerald-light)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    {copiedId === 'lightbox' ? <Check size={14} /> : <Copy size={14} />}
                    {copiedId === 'lightbox' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}

              <button
                onClick={() => setLightboxQr(null)}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Close Preview
              </button>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
