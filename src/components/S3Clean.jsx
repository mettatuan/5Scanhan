import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from './Sidebar';
import './StepPages.css';

function S3Clean({ userSession }) {
  const { areaName } = useParams();
  const navigate = useNavigate();
  const [currentArea, setCurrentArea] = useState(null);
  const [lifeAreas, setLifeAreas] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [newReflection, setNewReflection] = useState('');
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
      const { data: cleanReflections } = await supabase
        .from('s3_clean_reflections')
        .select('*')
        .eq('session_id', userSession.session_id)
        .eq('area_id', area.id)
        .order('reflection_date', { ascending: false });

      setReflections(cleanReflections || []);
    }

    setLoading(false);
  }

  async function addReflection() {
    if (!newReflection.trim()) return;

    const { data, error } = await supabase
      .from('s3_clean_reflections')
      .insert({
        session_id: userSession.session_id,
        area_id: currentArea.id,
        reflection_text: newReflection.trim(),
        action_taken: '',
        reflection_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (!error && data) {
      setReflections([data, ...reflections]);
      setNewReflection('');
    }
  }

  async function updateAction(reflectionId, action) {
    await supabase
      .from('s3_clean_reflections')
      .update({ action_taken: action })
      .eq('id', reflectionId);

    setReflections((prev) =>
      prev.map((item) =>
        item.id === reflectionId ? { ...item, action_taken: action } : item
      )
    );
  }

  async function deleteReflection(reflectionId) {
    await supabase.from('s3_clean_reflections').delete().eq('id', reflectionId);
    setReflections((prev) => prev.filter((item) => item.id !== reflectionId));
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
            <div className="step-badge">Bước 3 / 5</div>
            <h1 className="step-title">S3 - Sạch sẽ</h1>
            <p className="step-subtitle">Rà soát, làm sạch định kỳ</p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/area/${areaName}/s4`)}
          >
            Tiếp theo: S4 →
          </button>
        </div>

        <div className="step-content">
          <div className="instruction-card card">
            <h2>Làm gì ở bước này?</h2>
            <p>
              Mỗi ngày hoặc mỗi tuần, dành chút thời gian để rà soát:
            </p>
            <ul>
              <li>Điều gì đang làm bạn cảm thấy nặng nề?</li>
              <li>Điều gì đang lộn xộn, không rõ ràng?</li>
              <li>Bạn sẽ làm gì để "làm sạch" nó?</li>
            </ul>
            <p className="instruction-note">
              Đây là bước tự nhận diện và điều chỉnh. Không cần viết dài, chỉ cần
              ghi ngắn gọn.
            </p>
          </div>

          <div className="action-card card">
            <h2>Ghi nhận hôm nay</h2>
            <div className="input-group-vertical">
              <textarea
                className="textarea"
                placeholder="Điều gì đang làm bạn cảm thấy rối, nặng, hoặc lộn xộn?"
                value={newReflection}
                onChange={(e) => setNewReflection(e.target.value)}
              />
              <button className="btn btn-primary" onClick={addReflection}>
                Ghi lại
              </button>
            </div>
          </div>

          <div className="reflections-list">
            {reflections.length === 0 ? (
              <div className="card">
                <p className="empty-message">
                  Chưa có ghi chú nào. Hãy bắt đầu ghi nhận điều gì đó.
                </p>
              </div>
            ) : (
              reflections.map((reflection) => (
                <ReflectionItem
                  key={reflection.id}
                  reflection={reflection}
                  onUpdateAction={updateAction}
                  onDelete={deleteReflection}
                />
              ))
            )}
          </div>

          <div className="navigation-footer">
            <button
              className="btn btn-ghost"
              onClick={() => navigate(`/area/${areaName}/s2`)}
            >
              ← S2: Sắp xếp
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/area/${areaName}/s4`)}
            >
              Tiếp theo: S4 - Tiêu chuẩn →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReflectionItem({ reflection, onUpdateAction, onDelete }) {
  const [isEditingAction, setIsEditingAction] = useState(false);
  const [action, setAction] = useState(reflection.action_taken);

  function saveAction() {
    onUpdateAction(reflection.id, action);
    setIsEditingAction(false);
  }

  const date = new Date(reflection.reflection_date).toLocaleDateString('vi-VN');

  return (
    <div className="reflection-card card">
      <div className="reflection-header">
        <span className="reflection-date">{date}</span>
        <button
          className="btn-icon delete"
          onClick={() => onDelete(reflection.id)}
          title="Xóa"
        >
          🗑️
        </button>
      </div>

      <div className="reflection-text">{reflection.reflection_text}</div>

      <div className="reflection-action">
        <strong>Hành động:</strong>
        {isEditingAction ? (
          <div className="action-edit">
            <textarea
              className="textarea"
              placeholder="Bạn đã hoặc sẽ làm gì?"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            />
            <div className="action-buttons">
              <button className="btn btn-sm btn-primary" onClick={saveAction}>
                Lưu
              </button>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setIsEditingAction(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <div className="action-display" onClick={() => setIsEditingAction(true)}>
            {reflection.action_taken ? (
              <p className="action-text">{reflection.action_taken}</p>
            ) : (
              <p className="action-placeholder">+ Thêm hành động</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default S3Clean;
