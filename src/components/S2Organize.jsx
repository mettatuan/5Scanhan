import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from './Sidebar';
import './StepPages.css';

function S2Organize({ userSession }) {
  const { areaName } = useParams();
  const navigate = useNavigate();
  const [currentArea, setCurrentArea] = useState(null);
  const [lifeAreas, setLifeAreas] = useState([]);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
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
      const { data: organizeItems } = await supabase
        .from('s2_organize_items')
        .select('*')
        .eq('session_id', userSession.session_id)
        .eq('area_id', area.id)
        .order('created_at', { ascending: false });

      setItems(organizeItems || []);
    }

    setLoading(false);
  }

  async function addItem() {
    if (!newItem.trim()) return;

    const { data, error } = await supabase
      .from('s2_organize_items')
      .insert({
        session_id: userSession.session_id,
        area_id: currentArea.id,
        item_text: newItem.trim(),
        priority_level: 'medium',
        fixed_position: ''
      })
      .select()
      .single();

    if (!error && data) {
      setItems([data, ...items]);
      setNewItem('');
    }
  }

  async function updatePriority(itemId, priority) {
    await supabase
      .from('s2_organize_items')
      .update({ priority_level: priority })
      .eq('id', itemId);

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, priority_level: priority } : item
      )
    );
  }

  async function updatePosition(itemId, position) {
    await supabase
      .from('s2_organize_items')
      .update({ fixed_position: position })
      .eq('id', itemId);

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, fixed_position: position } : item
      )
    );
  }

  async function deleteItem(itemId) {
    await supabase.from('s2_organize_items').delete().eq('id', itemId);
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const highItems = items.filter((item) => item.priority_level === 'high');
  const mediumItems = items.filter((item) => item.priority_level === 'medium');
  const lowItems = items.filter((item) => item.priority_level === 'low');

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
            <div className="step-badge">Bước 2 / 5</div>
            <h1 className="step-title">S2 - Sắp xếp</h1>
            <p className="step-subtitle">Đặt đúng vị trí, ưu tiên rõ</p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/area/${areaName}/s3`)}
          >
            Tiếp theo: S3 →
          </button>
        </div>

        <div className="step-content">
          <div className="instruction-card card">
            <h2>Làm gì ở bước này?</h2>
            <p>
              Với những gì bạn quyết định GIỮ LẠI ở S1, bây giờ hãy:
            </p>
            <ul>
              <li>Xác định mức độ ưu tiên (Cao / Trung bình / Thấp)</li>
              <li>Xác định vị trí cố định (khi nào / ở đâu)</li>
            </ul>
            <p className="instruction-note">
              Ví dụ: Công việc quan trọng làm buổi sáng, tập thể dục mỗi tối 7h...
            </p>
          </div>

          <div className="action-card card">
            <h2>Thêm mục cần sắp xếp</h2>
            <div className="input-group">
              <input
                type="text"
                className="input"
                placeholder="Nhập điều gì đó bạn muốn sắp xếp..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem()}
              />
              <button className="btn btn-primary" onClick={addItem}>
                Thêm
              </button>
            </div>
          </div>

          <div className="priority-sections">
            <div className="priority-section card">
              <h3 className="section-title high">Ưu tiên cao ({highItems.length})</h3>
              <div className="items-list">
                {highItems.length === 0 ? (
                  <p className="empty-message">Chưa có mục nào</p>
                ) : (
                  highItems.map((item) => (
                    <OrganizeItem
                      key={item.id}
                      item={item}
                      onUpdatePriority={updatePriority}
                      onUpdatePosition={updatePosition}
                      onDelete={deleteItem}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="priority-section card">
              <h3 className="section-title medium">
                Ưu tiên trung bình ({mediumItems.length})
              </h3>
              <div className="items-list">
                {mediumItems.length === 0 ? (
                  <p className="empty-message">Chưa có mục nào</p>
                ) : (
                  mediumItems.map((item) => (
                    <OrganizeItem
                      key={item.id}
                      item={item}
                      onUpdatePriority={updatePriority}
                      onUpdatePosition={updatePosition}
                      onDelete={deleteItem}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="priority-section card">
              <h3 className="section-title low">Ưu tiên thấp ({lowItems.length})</h3>
              <div className="items-list">
                {lowItems.length === 0 ? (
                  <p className="empty-message">Chưa có mục nào</p>
                ) : (
                  lowItems.map((item) => (
                    <OrganizeItem
                      key={item.id}
                      item={item}
                      onUpdatePriority={updatePriority}
                      onUpdatePosition={updatePosition}
                      onDelete={deleteItem}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="navigation-footer">
            <button
              className="btn btn-ghost"
              onClick={() => navigate(`/area/${areaName}/s1`)}
            >
              ← S1: Sàng lọc
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/area/${areaName}/s3`)}
            >
              Tiếp theo: S3 - Sạch sẽ →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrganizeItem({ item, onUpdatePriority, onUpdatePosition, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [position, setPosition] = useState(item.fixed_position);

  function savePosition() {
    onUpdatePosition(item.id, position);
    setIsEditing(false);
  }

  return (
    <div className="organize-item">
      <div className="organize-header">
        <div className="item-text">{item.item_text}</div>
        <div className="item-actions">
          <select
            className="priority-select"
            value={item.priority_level}
            onChange={(e) => onUpdatePriority(item.id, e.target.value)}
          >
            <option value="high">Cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>
          <button
            className="btn-icon delete"
            onClick={() => onDelete(item.id)}
            title="Xóa"
          >
            🗑️
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="position-edit">
          <input
            type="text"
            className="input"
            placeholder="Ví dụ: Mỗi sáng 6h, Cuối tuần..."
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
          <button className="btn btn-sm btn-primary" onClick={savePosition}>
            Lưu
          </button>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setIsEditing(false)}
          >
            Hủy
          </button>
        </div>
      ) : (
        <div className="position-display" onClick={() => setIsEditing(true)}>
          {item.fixed_position ? (
            <span className="position-text">📍 {item.fixed_position}</span>
          ) : (
            <span className="position-placeholder">+ Thêm vị trí cố định</span>
          )}
        </div>
      )}
    </div>
  );
}

export default S2Organize;
