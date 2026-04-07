// src/modules/masters/pages/HsnMasterPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Check, X, Hash, RefreshCw, Percent, Calendar } from 'lucide-react';
import { apiClient } from '../../../lib';

const BASE = '/api/v1/inventory/hsn';

const TAX_SLABS = [0, 0.1, 0.25, 1, 1.5, 3, 5, 6, 7.5, 12, 18, 28];

const HsnMasterPage = () => {
  const [hsnList, setHsnList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    hsn_code: '', hsn_desc: '', gst_rate: 18, cgst: 9, sgst: 9, igst: 18, cess: 0,
    wef_date: '', wef_todate: '', is_active: 'Y'
  });
  const [addSaving, setAddSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  // Normalize API response keys (UPPERCASE from SP) to internal format
  const norm = (res) => {
    const raw = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    return raw.map(h => ({
      id:        h.GSTHSNID   ?? h.GstHsnId   ?? h.id   ?? 0,
      hsn_code:  h.HSN_CODE   ?? h.HsnCode    ?? h.hsn_code  ?? '',
      hsn_desc:  h.HSN_DESC   ?? h.HsnDesc    ?? h.hsn_desc  ?? '',
      gst_rate:  parseFloat(h.GSTRATE ?? h.GstRate ?? h.gst_rate ?? 0),
      cgst:      parseFloat(h.CGST    ?? h.cgst   ?? 0),
      sgst:      parseFloat(h.SGST    ?? h.sgst   ?? 0),
      igst:      parseFloat(h.IGST    ?? h.igst   ?? 0),
      cess:      parseFloat(h.CESS    ?? h.cess   ?? 0),
      wef_date:  h.WEFDATE    ?? h.WefDate    ?? h.wef_date   ?? null,
      wef_todate:h.WEFTODATE  ?? h.WefToDate  ?? h.wef_todate ?? null,
      is_active: h.ISACTIVE   ?? h.IsActive   ?? h.is_active  ?? 'Y'
    }));
  };

  const fetchHsn = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(BASE);
      let data = norm(res);
      if (search) {
        const s = search.toLowerCase();
        data = data.filter(h =>
          h.hsn_code.toLowerCase().includes(s) ||
          h.hsn_desc.toLowerCase().includes(s)
        );
      }
      setHsnList(data);
    } catch (err) {
      showAlert(err?.message || 'Failed to load HSN codes', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchHsn(); }, [fetchHsn]);

  // Auto-split GST rate into CGST/SGST/IGST
  const autoSplitGst = (form, gstRate) => {
    const rate = parseFloat(gstRate) || 0;
    return { ...form, gst_rate: rate, cgst: rate / 2, sgst: rate / 2, igst: rate };
  };

  // ─── Inline Edit ───────────────────────────────────────
  const handleDoubleClick = (hsn) => {
    setEditingId(hsn.id);
    setEditForm({
      hsn_code: hsn.hsn_code,
      hsn_desc: hsn.hsn_desc || '',
      gst_rate: hsn.gst_rate,
      cgst: hsn.cgst,
      sgst: hsn.sgst,
      igst: hsn.igst,
      cess: hsn.cess,
      wef_date: hsn.wef_date ? hsn.wef_date.substring(0, 10) : '',
      wef_todate: hsn.wef_todate ? hsn.wef_todate.substring(0, 10) : '',
      is_active: hsn.is_active
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    if (!editForm.hsn_code?.trim()) return showAlert('HSN code is required', 'danger');
    setSavingId(id);
    try {
      await apiClient.put(`${BASE}/${id}`, editForm);
      showAlert('HSN updated successfully');
      fetchHsn();
    } catch (err) {
      showAlert(err?.message || 'Update failed', 'danger');
    } finally {
      setSavingId(null);
      cancelEdit();
    }
  };

  // ─── Delete ────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this HSN code?')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`${BASE}/${id}`);
      setHsnList(prev => prev.filter(h => h.id !== id));
      showAlert('HSN code deleted');
    } catch (err) {
      showAlert(err?.message || 'Delete failed', 'danger');
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Add Modal ─────────────────────────────────────────
  const openAddModal = () => {
    setAddForm({
      hsn_code: '', hsn_desc: '', gst_rate: 18, cgst: 9, sgst: 9, igst: 18, cess: 0,
      wef_date: new Date().toISOString().substring(0, 10), wef_todate: '', is_active: 'Y'
    });
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    if (!addForm.hsn_code?.trim()) return showAlert('HSN code is required', 'danger');
    setAddSaving(true);
    try {
      await apiClient.post(BASE, addForm);
      setShowAddModal(false);
      showAlert('HSN code added successfully');
      fetchHsn();
    } catch (err) {
      showAlert(err?.message || 'Failed to add HSN', 'danger');
    } finally {
      setAddSaving(false);
    }
  };

  const getTaxBadgeColor = (rate) => {
    if (rate === 0) return { bg: '#f3f4f6', text: '#374151' };
    if (rate <= 5) return { bg: '#dcfce7', text: '#166534' };
    if (rate <= 12) return { bg: '#dbeafe', text: '#1e40af' };
    if (rate <= 18) return { bg: '#fef3c7', text: '#92400e' };
    return { bg: '#fee2e2', text: '#991b1b' };
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  };

  return (
    <div className="container-fluid p-0">
      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible mb-3 shadow-sm`} role="alert">
          {alert.msg}
          <button type="button" className="btn-close" onClick={() => setAlert(null)} />
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 gradient-text d-flex align-items-center gap-2">
            <Hash size={22} /> HSN Master
          </h4>
          <p className="text-muted small mb-0">{hsnList.length} HSN codes • GST classification • Double-tap to quick edit</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" className="rounded-pill" onClick={fetchHsn} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </Button>
          <Button variant="primary" className="btn-glossy d-flex align-items-center gap-2 rounded-pill shadow-sm" onClick={openAddModal}>
            <Plus size={18} /> Add HSN
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="glass-card border-0 mb-4">
        <Card.Body className="py-2">
          <InputGroup>
            <InputGroup.Text className="bg-transparent border-end-0"><Search size={15} className="text-muted" /></InputGroup.Text>
            <Form.Control
              placeholder="Search by HSN code or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-start-0 shadow-none"
            />
            {search && <Button variant="light" onClick={() => setSearch('')}><X size={14} /></Button>}
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="glass-card border-0 overflow-hidden">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center p-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : hsnList.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <Hash size={48} className="mb-3 opacity-25" />
            <p>No HSN codes found. Add one to get started.</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <Table hover className="align-middle mb-0 d-none d-md-table">
              <thead className="bg-light bg-opacity-50">
                <tr>
                  <th className="border-0">#</th>
                  <th className="border-0">HSN Code</th>
                  <th className="border-0">Description</th>
                  <th className="border-0 text-center">GST Rate</th>
                  <th className="border-0 text-center">CGST</th>
                  <th className="border-0 text-center">SGST</th>
                  <th className="border-0 text-center">IGST</th>
                  <th className="border-0 text-center">WEF Date</th>
                  <th className="border-0 text-center">Status</th>
                  <th className="border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hsnList.map((hsn, idx) => {
                  const isEditing = editingId === hsn.id;
                  const taxColors = getTaxBadgeColor(hsn.gst_rate);
                  return (
                    <tr
                      key={hsn.id}
                      onDoubleClick={() => !isEditing && handleDoubleClick(hsn)}
                      style={{ cursor: isEditing ? 'default' : 'pointer' }}
                      className={isEditing ? 'table-active' : ''}
                    >
                      <td className="text-muted small">{idx + 1}</td>
                      <td>
                        {isEditing ? (
                          <Form.Control size="sm" style={{ maxWidth: 120 }} value={editForm.hsn_code} onChange={e => setEditForm(p => ({ ...p, hsn_code: e.target.value }))} autoFocus />
                        ) : (
                          <div className="d-flex align-items-center gap-2">
                            <div className="bg-warning bg-opacity-10 text-warning rounded p-1">
                              <Hash size={16} />
                            </div>
                            <code className="text-dark fw-bold">{hsn.hsn_code}</code>
                          </div>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <Form.Control size="sm" value={editForm.hsn_desc} onChange={e => setEditForm(p => ({ ...p, hsn_desc: e.target.value }))} placeholder="Description" />
                        ) : (
                          <span className="text-muted small">{hsn.hsn_desc || '—'}</span>
                        )}
                      </td>
                      <td className="text-center" style={{ width: 100 }}>
                        {isEditing ? (
                          <Form.Select size="sm" value={editForm.gst_rate} onChange={e => setEditForm(p => autoSplitGst(p, e.target.value))}>
                            {TAX_SLABS.map(t => <option key={t} value={t}>{t}%</option>)}
                          </Form.Select>
                        ) : (
                          <Badge className="border-0 rounded-pill px-3 py-2 fw-bold" style={{ backgroundColor: taxColors.bg, color: taxColors.text, fontSize: '0.75rem' }}>
                            <Percent size={10} className="me-1" />{hsn.gst_rate}%
                          </Badge>
                        )}
                      </td>
                      <td className="text-center small text-muted">{hsn.cgst}%</td>
                      <td className="text-center small text-muted">{hsn.sgst}%</td>
                      <td className="text-center small text-muted">{hsn.igst}%</td>
                      <td className="text-center small text-muted">
                        {isEditing ? (
                          <Form.Control size="sm" type="date" value={editForm.wef_date} onChange={e => setEditForm(p => ({ ...p, wef_date: e.target.value }))} />
                        ) : (
                          formatDate(hsn.wef_date)
                        )}
                      </td>
                      <td className="text-center" style={{ width: 100 }}>
                        {isEditing ? (
                          <Form.Select size="sm" value={editForm.is_active} onChange={e => setEditForm(p => ({ ...p, is_active: e.target.value }))}>
                            <option value="Y">Active</option>
                            <option value="N">Inactive</option>
                          </Form.Select>
                        ) : (
                          <Badge className="border-0 rounded-pill px-3 py-2 fw-bold" style={{
                            backgroundColor: hsn.is_active === 'Y' ? '#dcfce7' : '#f3f4f6',
                            color: hsn.is_active === 'Y' ? '#166534' : '#374151',
                            fontSize: '0.75rem'
                          }}>
                            {hsn.is_active === 'Y' ? 'Active' : 'Inactive'}
                          </Badge>
                        )}
                      </td>

                      <td className="text-end">
                        {isEditing ? (
                          <div className="d-flex justify-content-end gap-2">
                            <Button variant="success" size="sm" className="rounded-circle btn-icon" onClick={() => saveEdit(hsn.id)} disabled={savingId === hsn.id}>
                              {savingId === hsn.id ? <Spinner size="sm" animation="border" /> : <Check size={15} />}
                            </Button>
                            <Button variant="secondary" size="sm" className="rounded-circle btn-icon" onClick={cancelEdit} disabled={savingId === hsn.id}>
                              <X size={15} />
                            </Button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-end gap-1">
                            <Button variant="light" size="sm" className="rounded-circle btn-icon text-primary" title="Edit" onClick={() => handleDoubleClick(hsn)}>
                              <Edit size={15} />
                            </Button>
                            <Button variant="light" size="sm" className="rounded-circle btn-icon text-danger" title="Delete" onClick={() => handleDelete(hsn.id)} disabled={deletingId === hsn.id}>
                              {deletingId === hsn.id ? <Spinner size="sm" animation="border" /> : <Trash2 size={15} />}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            {/* Mobile Cards */}
            <div className="d-block d-md-none">
              {hsnList.map(hsn => {
                const taxColors = getTaxBadgeColor(hsn.gst_rate);
                return (
                  <div key={hsn.id} className="p-3 border-bottom">
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center" style={{ width: 42, height: 42, minWidth: 42 }}>
                        <Hash size={18} />
                      </div>
                      <div className="flex-fill">
                        <div className="fw-bold font-monospace">{hsn.hsn_code}</div>
                        <div className="small text-muted">{hsn.hsn_desc || '—'}</div>
                      </div>
                      <Badge className="border-0 rounded-pill px-2 py-1" style={{ backgroundColor: taxColors.bg, color: taxColors.text }}>
                        {hsn.gst_rate}%
                      </Badge>
                    </div>
                    <div className="d-flex gap-3 mb-2 small text-muted">
                      <span>CGST: {hsn.cgst}%</span>
                      <span>SGST: {hsn.sgst}%</span>
                      <span>IGST: {hsn.igst}%</span>
                      {hsn.cess > 0 && <span>Cess: {hsn.cess}%</span>}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="small text-muted">
                        <Calendar size={12} className="me-1" />WEF: {formatDate(hsn.wef_date)}
                      </div>
                      <div className="d-flex gap-1">
                        <Button variant="light" size="sm" className="rounded-circle btn-icon text-primary" onClick={() => handleDoubleClick(hsn)}><Edit size={14} /></Button>
                        <Button variant="light" size="sm" className="rounded-circle btn-icon text-danger" onClick={() => handleDelete(hsn.id)}><Trash2 size={14} /></Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Add HSN Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2">
            <Hash size={20} className="text-warning" /> Add New HSN Code
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Row className="g-3">
            <Col xs={12} sm={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">HSN Code <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  placeholder="e.g. 8471"
                  value={addForm.hsn_code}
                  onChange={e => setAddForm(p => ({ ...p, hsn_code: e.target.value }))}
                  autoFocus
                />
                <Form.Text className="text-muted">4–8 digit code as per GST</Form.Text>
              </Form.Group>
            </Col>
            <Col xs={12} sm={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">GST Rate (%)</Form.Label>
                <Form.Select value={addForm.gst_rate} onChange={e => setAddForm(p => autoSplitGst(p, e.target.value))}>
                  {TAX_SLABS.map(t => <option key={t} value={t}>{t}%</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} sm={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Status</Form.Label>
                <Form.Select value={addForm.is_active} onChange={e => setAddForm(p => ({ ...p, is_active: e.target.value }))}>
                  <option value="Y">Active</option>
                  <option value="N">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="e.g. Wheat, Computers, printers and other office machines..."
                  value={addForm.hsn_desc}
                  onChange={e => setAddForm(p => ({ ...p, hsn_desc: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col xs={6} sm={3}>
              <Form.Group>
                <Form.Label className="fw-semibold small">CGST (%)</Form.Label>
                <Form.Control type="number" step="0.01" value={addForm.cgst} onChange={e => setAddForm(p => ({ ...p, cgst: parseFloat(e.target.value) || 0 }))} />
              </Form.Group>
            </Col>
            <Col xs={6} sm={3}>
              <Form.Group>
                <Form.Label className="fw-semibold small">SGST (%)</Form.Label>
                <Form.Control type="number" step="0.01" value={addForm.sgst} onChange={e => setAddForm(p => ({ ...p, sgst: parseFloat(e.target.value) || 0 }))} />
              </Form.Group>
            </Col>
            <Col xs={6} sm={3}>
              <Form.Group>
                <Form.Label className="fw-semibold small">IGST (%)</Form.Label>
                <Form.Control type="number" step="0.01" value={addForm.igst} onChange={e => setAddForm(p => ({ ...p, igst: parseFloat(e.target.value) || 0 }))} />
              </Form.Group>
            </Col>
            <Col xs={6} sm={3}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Cess (%)</Form.Label>
                <Form.Control type="number" step="0.01" value={addForm.cess} onChange={e => setAddForm(p => ({ ...p, cess: parseFloat(e.target.value) || 0 }))} />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">WEF Date (From)</Form.Label>
                <Form.Control type="date" value={addForm.wef_date} onChange={e => setAddForm(p => ({ ...p, wef_date: e.target.value }))} />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">WEF To Date (Optional)</Form.Label>
                <Form.Control type="date" value={addForm.wef_todate} onChange={e => setAddForm(p => ({ ...p, wef_todate: e.target.value }))} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="rounded-pill px-4" onClick={() => setShowAddModal(false)} disabled={addSaving}>Cancel</Button>
          <Button variant="primary" className="btn-glossy rounded-pill px-4" onClick={handleAdd} disabled={addSaving}>
            {addSaving ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</> : <><Check size={16} className="me-1" />Save HSN</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HsnMasterPage;
