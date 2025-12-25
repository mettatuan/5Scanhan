import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from './Sidebar';
import './StepPages.css';

function S4Standardize({ userSession }) {
  const { areaName } = useParams();
  const navigate = useNavigate();
  const [currentArea, setCurrentArea] = useState(null);
  const [lifeAreas, setLifeAreas] = useState([]);
  const [standards, setStandards] = useState([]);
  const [newTrigger, setNewTrigger] = useState('');
  const [newAction, setNewAction] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [areaName]);

  async function loadData() {
    const { data: areas } = await supabase
      .from('life_areas')
      .select('*')
      .order('sort_order');

    setLifeAreas(areas || []);

    const area = areas?.find((a) => a.name === areaName);
    setCurrentArea(area);

    if (area) {
      const { data: standardsList } = await supabase
        .from('s4_standards')
        .select('*')
        .eq('session_id', userSession.session_id)
        .eq('area_id', area.id)
        .order('created_at', { ascending: false });

      setStandards(standardsList || []);
    }

    setLoading(false);
  }

  async function addStandard() {
    if (!newTrigger.trim() || !newAction.trim()) return;

    const { data, error } = await supabase
      .from('s4_standards')
      .insert({
        session_id: userSession.session_id,
        area_id: currentArea.id,
        trigger: newTrigger.trim(),
        action: newAction.trim()
      })
      .select()
      .single();

    if (!error && data) {
      setStandards([data, ...standards]);
      setNewTrigger('');
      setNewAction('');
    }
  }

  async function deleteStandard(standardId) {
    await supabase.from('s4_standards').delete().eq('id', standardId);
    setStandards((prev) => prev.filter((item) => item.id !== standardId));
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="step-page">
      <Sidebar
        currentArea={currentArea}
        lifeAreas={lifeAreas}
        userSession={userSession}
      />

      <div className="step-main">
        <div className="step-header">
          <div>
            <div className="step-badge">Bước 4 / 5</div>
            <h1 className="step-title">S4 - Tiêu chuẩn</h1>
            <p className="step-subtitle">Tạo quy tắc đơn giản</p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/area/${areaName}/s5`)}
          >
            Tiếp theo: S5 →
          </button>
        </div>

        <div className="step-content">
          <div className="instruction-card card">
            <h2>Làm gì ở bước này?</h2>
            <p>
              Tạo các quy tắc đơn giản cho chính mình theo công thức:
            </p>
            <div className="formula">
              <strong>Khi [X xảy ra] → Tôi sẽ [làm Y]</strong>
            </div>
            <p className="instruction-note">
              Ví dụ: Khi thức dậy → Tôi uống 1 cốc nước
              <br />
              Khi cảm thấy căng thẳng → Tôi hít thở sâu 5 lần
            </p>
          </div>

          <div className="action-card card">
            <h2>Tạo tiêu chuẩn mới</h2>
            <div className="standard-form">
              <div className="form-row">
                <label>Khi nào? (Trigger)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ví dụ: Khi thức dậy, Khi cảm thấy mệt..."
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                />
              </div>
              <div className="form-row">
                <label>Làm gì? (Action)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ví dụ: Uống 1 cốc nước, Nghỉ 5 phút..."
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={addStandard}>
                Thêm tiêu chuẩn
              </button>
            </div>
          </div>

          <div className="standards-list">
            <h2>Các tiêu chuẩn của bạn</h2>
            {standards.length === 0 ? (
              <div className="card">
                <p className="empty-message">
                  Chưa có tiêu chuẩn nào. Hãy tạo tiêu chuẩn đầu tiên.
                </p>
              </div>
            ) : (
              <div className="standards-grid">
                {standards.map((standard) => (
                  <div key={standard.id} className="standard-card card">
                    <button
                      className="btn-icon delete standard-delete"
                      onClick={() => deleteStandard(standard.id)}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                    <div className="standard-content">
                      <div className="standard-trigger">
                        <span className="label">Khi:</span>
                        <span className="text">{standard.trigger}</span>
                      </div>
                      <div className="standard-arrow">→</div>
                      <div className="standard-action">
                        <span className="label">Tôi:</span>
                        <span className="text">{standard.action}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="navigation-footer">
            <button
              className="btn btn-ghost"
              onClick={() => navigate(`/area/${areaName}/s3`)}
            >
              ← S3: Sạch sẽ
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/area/${areaName}/s5`)}
            >
              Tiếp theo: S5 - Tâm thế →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default S4Standardize;
