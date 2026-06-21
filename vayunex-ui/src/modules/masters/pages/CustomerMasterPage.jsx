// src/modules/masters/pages/CustomerMasterPage.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Row, Col, Card, Table, Badge, Button, Form,
  InputGroup, Spinner, Modal, Nav, Tab
} from 'react-bootstrap';
import {
  Plus, Search, Edit, Trash2, Users, RefreshCw,
  Building2, Phone, Mail, MapPin, ChevronDown, Landmark, X
} from 'lucide-react';
import { apiClient } from '../../../lib';

// ─── Address template ─────────────────────────────────────────────────────────
const makeAddress = (overrides = {}) => ({
  AddressType:   'Billing',
  AddressLine1:  '',
  AddressLine2:  '',
  CountryId:     '',
  StateId:       '',
  DistrictId:    '',
  CityId:        '',
  Pincode:       '',
  GSTIN:         '',
  PAN:           '',
  ContactPerson: '',
  MobileNo:      '',
  WhatsAppNo:    '',
  RMN:           '',
  Email:         '',
  BankName:      '',
  AccountNumber: '',
  IFSCCode:      '',
  BranchName:    '',
  IsDefault:     0,
  IsActive:      1,
  ...overrides,
});

const EMPTY_CUSTOMER = {
  CustomerName:    '',
  LegalName:       '',
  GSTIN:           '',
  PAN:             '',
  IsGSTRegistered: 0,
  MobileNo:        '',
  Email:           '',
  CustomerType:    'B2B',
  IsActive:        1,
  created_by:      1,
  Addresses:       [makeAddress({ IsDefault: 1 })],
};

// ─── Normalize list response ──────────────────────────────────────────────────
const norm = (res) => {
  const raw = Array.isArray(res)
    ? res
    : Array.isArray(res?.data)
      ? res.data
      : [];
  return raw.map(item => ({
    id:        item.CustomerId   ?? item.customer_id   ?? 0,
    code:      item.CustomerCode ?? item.customer_code ?? '—',
    name:      item.CustomerName ?? item.customer_name ?? '—',
    legalName: item.LegalName    ?? item.legal_name    ?? '',
    gstin:     item.GSTIN        ?? item.gstin         ?? '',
    pan:       item.PAN          ?? item.pan           ?? '',
    mobile:    item.MobileNo     ?? item.mobile_no     ?? '',
    email:     item.Email        ?? item.email         ?? '',
    type:      item.CustomerType ?? item.customer_type ?? 'B2B',
    accountId: item.AccountId    ?? item.account_id    ?? null,
    isActive:  item.IsActive     ?? item.is_active     ?? 0,
    createdOn: item.CreatedOn    ?? item.created_on    ?? null,
  }));
};

const TYPE_COLORS = { B2B: 'primary', B2C: 'success', Dealer: 'warning', Wholesale: 'info', Retail: 'secondary' };
const CustomerTypeBadge = ({ type }) => (
  <Badge bg={TYPE_COLORS[type] || 'secondary'} className="fw-normal rounded-pill px-2">{type}</Badge>
);

const ADDRESS_TYPE_OPTIONS = ['Billing', 'Shipping', 'Both', 'Registered', 'Other'];
const CUSTOMER_TYPES       = ['B2B', 'B2C', 'Dealer', 'Wholesale', 'Retail'];
const addrTypeBg           = { Billing: '#8b5cf6', Shipping: '#0ea5e9', Both: '#10b981', Registered: '#f59e0b', Other: '#6b7280' };

// ─────────────────────────────────────────────────────────────────────────────
//  Address Card — self-contained, manages its own geo-dropdowns
// ─────────────────────────────────────────────────────────────────────────────
const AddressCard = ({ addr, idx, totalCount, onChange, onRemove, isOnlyDefault }) => {
  const [countries, setCountries] = useState([]);
  const [states,    setStates]    = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities,    setCities]    = useState([]);
  const [open,      setOpen]      = useState(idx === 0);

  useEffect(() => {
    apiClient.get('/api/v1/inventory/countries/dropdown')
      .then(res => setCountries(res.data || res || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!addr.CountryId) { setStates([]); setDistricts([]); setCities([]); return; }
    apiClient.get(`/api/v1/inventory/states?country_id=${addr.CountryId}`)
      .then(res => setStates(res.data || res || []))
      .catch(() => setStates([]));
  }, [addr.CountryId]);

  useEffect(() => {
    if (!addr.StateId) { setDistricts([]); setCities([]); return; }
    apiClient.get(`/api/v1/inventory/districts?state_id=${addr.StateId}`)
      .then(res => setDistricts(res.data || res || []))
      .catch(() => setDistricts([]));
    apiClient.get(`/api/v1/inventory/cities?state_id=${addr.StateId}`)
      .then(res => setCities(res.data || res || []))
      .catch(() => setCities([]));
  }, [addr.StateId]);

  const f   = (field, val) => onChange(idx, field, val);
  const pill = addrTypeBg[addr.AddressType] || '#6b7280';

  return (
    <div className="border rounded-3 mb-3 overflow-hidden" style={{ boxShadow: open ? `0 0 0 2px ${pill}30` : 'none', transition: 'box-shadow .2s' }}>
      {/* Card Header */}
      <div
        className="d-flex align-items-center justify-content-between px-3 py-2"
        style={{ background: `${pill}12`, cursor: 'pointer' }}
        onClick={() => setOpen(o => !o)}
      >
        <div className="d-flex align-items-center gap-2">
          <MapPin size={15} style={{ color: pill }} />
          <span className="fw-semibold small" style={{ color: pill }}>
            Address {idx + 1} — {addr.AddressType}
          </span>
          {addr.IsDefault === 1 && (
            <Badge style={{ background: pill, fontSize: '0.65rem' }} className="rounded-pill">Default</Badge>
          )}
          {addr.AddressLine1 && (
            <span className="text-muted small d-none d-md-inline">
              — {addr.AddressLine1}{addr.Pincode ? `, ${addr.Pincode}` : ''}
            </span>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">
          {totalCount > 1 && (
            <Button
              size="sm" variant="light"
              className="rounded-circle p-0 d-flex align-items-center justify-content-center text-danger"
              style={{ width: 24, height: 24, zIndex: 2 }}
              onClick={e => { e.stopPropagation(); onRemove(idx); }}
              title="Remove address"
            >
              <X size={13} />
            </Button>
          )}
          <ChevronDown size={16} className="text-muted" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        </div>
      </div>

      {/* Card Body */}
      {open && (
        <div className="p-3">
          {/* Type + Pincode + Toggles */}
          <Row className="g-2 mb-3 align-items-end">
            <Col xs={6} md={4}>
              <Form.Label className="fw-medium small mb-1">Address Type</Form.Label>
              <Form.Select size="sm" value={addr.AddressType} onChange={e => f('AddressType', e.target.value)}>
                {ADDRESS_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </Form.Select>
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="fw-medium small mb-1">Pincode</Form.Label>
              <Form.Control size="sm" placeholder="135001" maxLength={6} value={addr.Pincode} onChange={e => f('Pincode', e.target.value)} />
            </Col>
            <Col xs={6} md={2} className="d-flex align-items-end">
              <Form.Check type="switch" label="Default" size="sm"
                checked={addr.IsDefault === 1}
                disabled={isOnlyDefault && addr.IsDefault === 1}
                onChange={e => f('IsDefault', e.target.checked ? 1 : 0)}
                className="mt-2"
              />
            </Col>
            <Col xs={6} md={3} className="d-flex align-items-end">
              <Form.Check type="switch" label="Active" size="sm"
                checked={addr.IsActive === 1}
                onChange={e => f('IsActive', e.target.checked ? 1 : 0)}
                className="mt-2"
              />
            </Col>
          </Row>

          {/* Address Lines */}
          <Row className="g-2 mb-3">
            <Col xs={12} md={6}>
              <Form.Label className="fw-medium small mb-1">Address Line 1</Form.Label>
              <Form.Control size="sm" placeholder="Street, Building No." value={addr.AddressLine1} onChange={e => f('AddressLine1', e.target.value)} />
            </Col>
            <Col xs={12} md={6}>
              <Form.Label className="fw-medium small mb-1">Address Line 2</Form.Label>
              <Form.Control size="sm" placeholder="Area, Landmark (optional)" value={addr.AddressLine2} onChange={e => f('AddressLine2', e.target.value)} />
            </Col>
          </Row>

          {/* Geo Cascade */}
          <Row className="g-2 mb-3">
            <Col xs={6} md={3}>
              <Form.Label className="fw-medium small mb-1">Country</Form.Label>
              <Form.Select size="sm" value={addr.CountryId} onChange={e => f('CountryId', e.target.value)}>
                <option value="">Select</option>
                {countries.map(c => <option key={c.CountryId} value={c.CountryId}>{c.CountryName}</option>)}
              </Form.Select>
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="fw-medium small mb-1">State</Form.Label>
              <Form.Select size="sm" value={addr.StateId} onChange={e => f('StateId', e.target.value)} disabled={!addr.CountryId}>
                <option value="">Select</option>
                {states.map(s => <option key={s.StateId} value={s.StateId}>{s.StateName}</option>)}
              </Form.Select>
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="fw-medium small mb-1">District</Form.Label>
              <Form.Select size="sm" value={addr.DistrictId} onChange={e => f('DistrictId', e.target.value)} disabled={!addr.StateId}>
                <option value="">Select</option>
                {districts.map(d => <option key={d.DistrictId || d.districtId} value={d.DistrictId || d.districtId}>{d.DistrictName || d.districtName}</option>)}
              </Form.Select>
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="fw-medium small mb-1">City</Form.Label>
              <Form.Select size="sm" value={addr.CityId} onChange={e => f('CityId', e.target.value)} disabled={!addr.StateId}>
                <option value="">Select</option>
                {cities.map(c => <option key={c.CityId || c.cityId} value={c.CityId || c.cityId}>{c.CityName || c.cityName}</option>)}
              </Form.Select>
            </Col>
          </Row>

          {/* GSTIN / PAN for address */}
          <Row className="g-2 mb-3">
            <Col xs={6} md={4}>
              <Form.Label className="fw-medium small mb-1">GSTIN</Form.Label>
              <Form.Control size="sm" placeholder="GSTIN for this address" maxLength={15} value={addr.GSTIN} onChange={e => f('GSTIN', e.target.value.toUpperCase())} />
            </Col>
            <Col xs={6} md={4}>
              <Form.Label className="fw-medium small mb-1">PAN</Form.Label>
              <Form.Control size="sm" placeholder="PAN" maxLength={10} value={addr.PAN} onChange={e => f('PAN', e.target.value.toUpperCase())} />
            </Col>
          </Row>

          {/* Contact Section */}
          <div className="d-flex align-items-center gap-2 mb-2 mt-1">
            <Phone size={13} className="text-muted" />
            <span className="text-muted small fw-semibold">Contact at this Address</span>
            <hr className="flex-grow-1 my-0" />
          </div>
          <Row className="g-2 mb-3">
            <Col xs={12} md={4}>
              <Form.Label className="fw-medium small mb-1">Contact Person</Form.Label>
              <Form.Control size="sm" placeholder="Name" value={addr.ContactPerson} onChange={e => f('ContactPerson', e.target.value)} />
            </Col>
            <Col xs={6} md={4}>
              <Form.Label className="fw-medium small mb-1">Mobile</Form.Label>
              <Form.Control size="sm" placeholder="9XXXXXXXXX" maxLength={15} value={addr.MobileNo} onChange={e => f('MobileNo', e.target.value)} />
            </Col>
            <Col xs={6} md={4}>
              <Form.Label className="fw-medium small mb-1">WhatsApp</Form.Label>
              <Form.Control size="sm" placeholder="9XXXXXXXXX" maxLength={15} value={addr.WhatsAppNo} onChange={e => f('WhatsAppNo', e.target.value)} />
            </Col>
            <Col xs={6} md={4}>
              <Form.Label className="fw-medium small mb-1">RMN</Form.Label>
              <Form.Control size="sm" placeholder="Registered Mobile" maxLength={15} value={addr.RMN} onChange={e => f('RMN', e.target.value)} />
            </Col>
            <Col xs={6} md={8}>
              <Form.Label className="fw-medium small mb-1">Email</Form.Label>
              <Form.Control size="sm" type="email" placeholder="email@example.com" value={addr.Email} onChange={e => f('Email', e.target.value)} />
            </Col>
          </Row>

          {/* Bank Section */}
          <div className="d-flex align-items-center gap-2 mb-2 mt-1">
            <Landmark size={13} className="text-muted" />
            <span className="text-muted small fw-semibold">Bank Details</span>
            <hr className="flex-grow-1 my-0" />
          </div>
          <Row className="g-2">
            <Col xs={12} md={4}>
              <Form.Label className="fw-medium small mb-1">Bank Name</Form.Label>
              <Form.Control size="sm" placeholder="e.g. HDFC Bank" value={addr.BankName} onChange={e => f('BankName', e.target.value)} />
            </Col>
            <Col xs={6} md={4}>
              <Form.Label className="fw-medium small mb-1">Account Number</Form.Label>
              <Form.Control size="sm" placeholder="Account number" value={addr.AccountNumber} onChange={e => f('AccountNumber', e.target.value)} />
            </Col>
            <Col xs={6} md={4}>
              <Form.Label className="fw-medium small mb-1">IFSC Code</Form.Label>
              <Form.Control size="sm" placeholder="HDFC0001234" maxLength={11} value={addr.IFSCCode} onChange={e => f('IFSCCode', e.target.value.toUpperCase())} />
            </Col>
            <Col xs={12} md={4}>
              <Form.Label className="fw-medium small mb-1">Branch Name</Form.Label>
              <Form.Control size="sm" placeholder="e.g. Andheri West" value={addr.BranchName} onChange={e => f('BranchName', e.target.value)} />
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  CustomerFormModal — shared for both Add and Edit
// ─────────────────────────────────────────────────────────────────────────────
const CustomerFormModal = ({ show, onHide, mode, initialData, onSuccess, showAlert }) => {
  const isEdit = mode === 'edit';

  const [form,    setForm]    = useState(() => JSON.parse(JSON.stringify(EMPTY_CUSTOMER)));
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab,     setTab]     = useState('basic');

  // When modal opens: reset or load data
  useEffect(() => {
    if (!show) return;
    setTab('basic');
    if (isEdit && initialData?.id) {
      setLoading(true);
      apiClient.get(`/api/v1/inventory/customers/${initialData.id}`)
        .then(res => {
          const d = res?.data ?? res;
          const rawAddresses = Array.isArray(d.addresses) && d.addresses.length > 0
            ? d.addresses.map(a => makeAddress({
                AddressType:   a.AddressType   || 'Billing',
                AddressLine1:  a.AddressLine1  || '',
                AddressLine2:  a.AddressLine2  || '',
                CountryId:     a.CountryId     || '',
                StateId:       a.StateId       || '',
                DistrictId:    a.DistrictId    || '',
                CityId:        a.CityId        || '',
                Pincode:       a.Pincode        || '',
                GSTIN:         a.GSTIN          || '',
                PAN:           a.PAN            || '',
                ContactPerson: a.ContactPerson  || '',
                MobileNo:      a.MobileNo       || '',
                WhatsAppNo:    a.WhatsAppNo     || '',
                RMN:           a.RMN            || '',
                Email:         a.Email          || '',
                BankName:      a.BankName       || '',
                AccountNumber: a.AccountNumber  || '',
                IFSCCode:      a.IFSCCode       || '',
                BranchName:    a.BranchName     || '',
                IsDefault:     a.IsDefault      ?? 0,
                IsActive:      a.IsActive       ?? 1,
                AddressId:     a.AddressId      || undefined,
              }))
            : [makeAddress({ IsDefault: 1 })];

          setForm({
            CustomerName:    d.CustomerName    || '',
            LegalName:       d.LegalName       || '',
            GSTIN:           d.GSTIN           || '',
            PAN:             d.PAN             || '',
            IsGSTRegistered: d.IsGSTRegistered ?? 0,
            MobileNo:        d.MobileNo        || '',
            Email:           d.Email           || '',
            CustomerType:    d.CustomerType    || 'B2B',
            IsActive:        d.IsActive        ?? 1,
            created_by:      1,
            Addresses:       rawAddresses,
          });
        })
        .catch(() => showAlert('Failed to load customer details', 'danger'))
        .finally(() => setLoading(false));
    } else {
      setForm(JSON.parse(JSON.stringify(EMPTY_CUSTOMER)));
    }
  }, [show, isEdit, initialData]);

  const addNewAddress = () =>
    setForm(f => ({ ...f, Addresses: [...f.Addresses, makeAddress()] }));

  const removeAddress = (idx) =>
    setForm(f => {
      if (f.Addresses.length <= 1) return f;
      const updated = f.Addresses.filter((_, i) => i !== idx);
      if (!updated.some(a => a.IsDefault === 1)) updated[0].IsDefault = 1;
      return { ...f, Addresses: updated };
    });

  const onAddressChange = (idx, field, val) =>
    setForm(f => {
      let addresses = f.Addresses.map((a, i) => i === idx ? { ...a, [field]: val } : a);
      if (field === 'IsDefault' && val === 1)
        addresses = addresses.map((a, i) => ({ ...a, IsDefault: i === idx ? 1 : 0 }));
      return { ...f, Addresses: addresses };
    });

  const handleSubmit = async () => {
    if (!form.CustomerName.trim() || !form.PAN.trim()) {
      showAlert('Customer Name and PAN are required', 'danger');
      setTab('basic');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await apiClient.put(`/api/v1/inventory/customers/${initialData.id}`, { ...form, updated_by: 1 });
        showAlert('Customer updated successfully');
      } else {
        await apiClient.post('/api/v1/inventory/customers', form);
        showAlert('Customer added successfully');
      }
      onHide();
      onSuccess();
    } catch (err) {
      showAlert(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'add'} customer`, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const addrCount      = form.Addresses.length;
  const hasOnlyDefault = form.Addresses.filter(a => a.IsDefault === 1).length <= 1;

  return (
    <Modal show={show} onHide={onHide} centered size="xl" scrollable>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold d-flex align-items-center gap-2">
          <Users size={20} style={{ color: '#8b5cf6' }} />
          {isEdit ? 'Edit Customer' : 'Add New Customer'}
          {isEdit && initialData?.code && (
            <span className="text-muted small fw-normal ms-1">— {initialData.code}</span>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-2">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center py-5">
            <Spinner animation="border" style={{ color: '#8b5cf6' }} />
            <span className="ms-3 text-muted">Loading customer details...</span>
          </div>
        ) : (
          <Tab.Container activeKey={tab} onSelect={k => setTab(k)}>
            <Nav variant="tabs" className="mb-3 border-bottom">
              <Nav.Item>
                <Nav.Link eventKey="basic" className="d-flex align-items-center gap-1">
                  <Building2 size={15} /> Basic Info
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="addresses" className="d-flex align-items-center gap-1">
                  <MapPin size={15} /> Addresses
                  <Badge pill bg="secondary" className="ms-1" style={{ fontSize: '0.65rem' }}>{addrCount}</Badge>
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* ── Basic Info ── */}
              <Tab.Pane eventKey="basic">
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">Customer Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control placeholder="e.g. ABC Traders" value={form.CustomerName} onChange={e => setForm(f => ({ ...f, CustomerName: e.target.value }))} />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">Legal Name</Form.Label>
                      <Form.Control placeholder="e.g. ABC Traders Pvt Ltd" value={form.LegalName} onChange={e => setForm(f => ({ ...f, LegalName: e.target.value }))} />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">PAN <span className="text-danger">*</span></Form.Label>
                      <Form.Control placeholder="e.g. ABCDE1234F" maxLength={10} value={form.PAN} onChange={e => setForm(f => ({ ...f, PAN: e.target.value.toUpperCase() }))} />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">GSTIN</Form.Label>
                      <Form.Control placeholder="e.g. 27ABCDE1234F1Z5" maxLength={15} value={form.GSTIN} onChange={e => setForm(f => ({ ...f, GSTIN: e.target.value.toUpperCase() }))} />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">Customer Type</Form.Label>
                      <Form.Select value={form.CustomerType} onChange={e => setForm(f => ({ ...f, CustomerType: e.target.value }))}>
                        {CUSTOMER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">Mobile</Form.Label>
                      <Form.Control placeholder="9XXXXXXXXX" maxLength={15} value={form.MobileNo} onChange={e => setForm(f => ({ ...f, MobileNo: e.target.value }))} />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={8}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">Email</Form.Label>
                      <Form.Control type="email" placeholder="email@example.com" value={form.Email} onChange={e => setForm(f => ({ ...f, Email: e.target.value }))} />
                    </Form.Group>
                  </Col>
                  <Col xs={6} md={3}>
                    <Form.Check type="switch" label="GST Registered"
                      checked={form.IsGSTRegistered === 1}
                      onChange={e => setForm(f => ({ ...f, IsGSTRegistered: e.target.checked ? 1 : 0 }))}
                      className="mt-4 pt-2"
                    />
                  </Col>
                  <Col xs={6} md={3}>
                    <Form.Check type="switch" label="Active"
                      checked={form.IsActive === 1}
                      onChange={e => setForm(f => ({ ...f, IsActive: e.target.checked ? 1 : 0 }))}
                      className="mt-4 pt-2"
                    />
                  </Col>
                </Row>
              </Tab.Pane>

              {/* ── Addresses ── */}
              <Tab.Pane eventKey="addresses">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted small fw-semibold">
                    {addrCount} address{addrCount !== 1 ? 'es' : ''} configured
                  </span>
                  <Button
                    size="sm"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none' }}
                    className="d-flex align-items-center gap-1 rounded-pill text-white px-3"
                    onClick={addNewAddress}
                  >
                    <Plus size={14} /> Add Address
                  </Button>
                </div>

                {form.Addresses.map((addr, idx) => (
                  <AddressCard
                    key={idx}
                    addr={addr}
                    idx={idx}
                    totalCount={addrCount}
                    onChange={onAddressChange}
                    onRemove={removeAddress}
                    isOnlyDefault={hasOnlyDefault}
                  />
                ))}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button variant="light" className="rounded-pill px-4" onClick={onHide}>Cancel</Button>
        <Button
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none' }}
          className="rounded-pill px-4 text-white"
          onClick={handleSubmit}
          disabled={saving || loading}
        >
          {saving
            ? <><Spinner size="sm" animation="border" className="me-2" />{isEdit ? 'Updating...' : 'Saving...'}</>
            : isEdit ? 'Update Customer' : 'Add Customer'
          }
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────────────────────────────────────
const CustomerMasterPage = () => {
  const [customers,  setCustomers]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filterType, setFilterType] = useState('');

  // Modal state — shared for add & edit
  const [modalMode,    setModalMode]    = useState('add');   // 'add' | 'edit'
  const [showModal,    setShowModal]    = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);    // { id, code } for edit

  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  // ── Fetch customers ─────────────────────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/inventory/customers');
      let data = norm(res);
      if (search)     data = data.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search));
      if (filterType) data = data.filter(c => c.type === filterType);
      setCustomers(data);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to load customers', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search, filterType]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // ── Open Add Modal ──────────────────────────────────────────────────────
  const openAdd = () => {
    setModalMode('add');
    setEditTarget(null);
    setShowModal(true);
  };

  // ── Open Edit Modal ─────────────────────────────────────────────────────
  const openEdit = (c) => {
    setModalMode('edit');
    setEditTarget({ id: c.id, code: c.code });
    setShowModal(true);
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    const prev = [...customers];
    setCustomers(customers.filter(c => c.id !== id));
    try {
      await apiClient.delete(`/api/v1/inventory/customers/${id}`, { data: { updated_by: 1 } });
      showAlert('Customer deleted');
    } catch (err) {
      setCustomers(prev);
      showAlert(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  return (
    <div className="container-fluid p-0">

      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible position-fixed top-0 end-0 m-3 shadow`}
          style={{ zIndex: 9999, minWidth: 280 }}>
          {alert.msg}
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Customer Master
          </h4>
          <p className="text-muted small mb-0">{customers.length} customers configured</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="light" size="sm" className="rounded-pill" onClick={fetchCustomers} title="Refresh">
            <RefreshCw size={16} />
          </Button>
          <Button
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none' }}
            className="d-flex align-items-center gap-2 rounded-pill shadow-sm text-white"
            onClick={openAdd}
          >
            <Plus size={18} /> Add Customer
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}>
        <Card.Body className="py-3">
          <Row className="g-2">
            <Col xs={12} md={5}>
              <InputGroup>
                <InputGroup.Text className="bg-transparent border-end-0"><Search size={16} className="text-muted" /></InputGroup.Text>
                <Form.Control
                  placeholder="Search by name, code, mobile..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent border-start-0 shadow-none"
                />
                {search && <Button variant="light" onClick={() => setSearch('')}><X size={14} /></Button>}
              </InputGroup>
            </Col>
            <Col xs={12} md={3}>
              <Form.Select value={filterType} onChange={e => setFilterType(e.target.value)} className="shadow-none">
                <option value="">All Types</option>
                {CUSTOMER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Form.Select>
            </Col>
            <Col xs={12} md={4}>
              <Button variant="outline-secondary" className="w-100 rounded-pill" onClick={() => { setSearch(''); setFilterType(''); }}>
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center p-5">
            <Spinner animation="border" style={{ color: '#8b5cf6' }} />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <Users size={48} className="mb-3 opacity-25" />
            <p>No customers found</p>
          </div>
        ) : (
          <div className="table-responsive">
            {/* Desktop Table */}
            <Table hover className="align-middle mb-0 d-none d-md-table">
              <thead className="table-light">
                <tr>
                  <th className="border-0">#</th>
                  <th className="border-0">Customer</th>
                  <th className="border-0">GSTIN / PAN</th>
                  <th className="border-0">Contact</th>
                  <th className="border-0 text-center">Type</th>
                  <th className="border-0 text-center">Status</th>
                  <th className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, idx) => (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => openEdit(c)}>
                    <td className="text-muted small">{idx + 1}</td>

                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold small"
                          style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', flexShrink: 0 }}
                        >
                          {(c.name?.[0] || 'C').toUpperCase()}
                        </div>
                        <div>
                          <span className="fw-semibold d-block">{c.name}</span>
                          <small className="text-muted">{c.code}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      {c.gstin && <code className="d-block bg-secondary bg-opacity-10 px-2 py-0 rounded small text-secondary mb-1">{c.gstin}</code>}
                      {c.pan   && <code className="d-block bg-secondary bg-opacity-10 px-2 py-0 rounded small text-secondary">{c.pan}</code>}
                      {!c.gstin && !c.pan && <span className="text-muted small">—</span>}
                    </td>

                    <td>
                      {c.mobile && <div className="d-flex align-items-center gap-1 small"><Phone size={12} className="text-muted" /> {c.mobile}</div>}
                      {c.email  && <div className="d-flex align-items-center gap-1 small text-muted"><Mail size={12} /> {c.email}</div>}
                    </td>

                    <td className="text-center"><CustomerTypeBadge type={c.type} /></td>

                    <td className="text-center">
                      <Badge bg={c.isActive ? 'success' : 'secondary'} className="fw-normal rounded-pill px-3">
                        {c.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>

                    <td className="text-end" onClick={e => e.stopPropagation()}>
                      <div className="d-flex justify-content-end gap-1">
                        <Button
                          size="sm" variant="light" className="rounded-circle p-1"
                          style={{ width: 28, height: 28 }}
                          title="Edit Customer"
                          onClick={() => openEdit(c)}
                        >
                          <Edit size={14} className="text-muted" />
                        </Button>
                        <Button
                          size="sm" variant="light" className="rounded-circle p-1"
                          style={{ width: 28, height: 28 }}
                          title="Delete Customer"
                          onClick={() => handleDelete(c.id)}
                        >
                          <Trash2 size={14} className="text-danger" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Mobile Cards */}
            <div className="d-block d-md-none">
              {customers.map(c => (
                <div key={c.id} className="p-3 border-bottom" onClick={() => openEdit(c)} style={{ cursor: 'pointer' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold small"
                        style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', flexShrink: 0 }}>
                        {(c.name?.[0] || 'C').toUpperCase()}
                      </div>
                      <div>
                        <span className="fw-semibold d-block">{c.name}</span>
                        <small className="text-muted">{c.code}</small>
                      </div>
                    </div>
                    <Badge bg={c.isActive ? 'success' : 'secondary'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <div className="small text-muted mb-1">Type: <CustomerTypeBadge type={c.type} /></div>
                  {c.mobile && <div className="small text-muted mb-1"><Phone size={12} className="me-1" />{c.mobile}</div>}
                  {c.gstin  && <div className="small text-muted mb-1">GSTIN: <code>{c.gstin}</code></div>}
                  <div className="d-flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="light" className="flex-fill" onClick={() => openEdit(c)}>
                      <Edit size={14} className="me-1" />Edit
                    </Button>
                    <Button size="sm" variant="light" className="flex-fill text-danger" onClick={() => handleDelete(c.id)}>
                      <Trash2 size={14} className="me-1" />Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Shared Add / Edit Modal */}
      <CustomerFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        mode={modalMode}
        initialData={editTarget}
        onSuccess={fetchCustomers}
        showAlert={showAlert}
      />
    </div>
  );
};

export default CustomerMasterPage;
