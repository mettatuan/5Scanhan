import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from './Sidebar';
import './StepPages.css';

function S1Filter({ userSession }) {
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
      const { data: filterItems } = await supabase
        .from('s1_filter_items')
        .select('*')
        .eq('session_id', userSession.session_id)
        .eq('area_id', area.id)
        .order('created_at', { ascending: false });

      setItems(filterItems || []);
    }

    setLoading(false);
  }

  async function addItem() {
    if (!newItem.trim()) return;

    const { data, error } = await supabase
      .from('s1_filter_items')
      .insert({
        session_id: userSession.session_id,
        area_id: currentArea.id,
        item_text: newItem.trim(),
        should_keep: true
      })
      .select()
      .single();

    if (!error && data) {
      setItems([data, ...items]);
      setNewItem('');
    }
  }

  async function toggleKeep(itemId, shouldKeep) {
    await supabase
      .from('s1_filter_items')
      .update({ should_keep: shouldKeep })
      .eq('id', itemId);

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, should_keep: shouldKeep } : item
      )
    );
  }

  async function deleteItem(itemId) {
    await supabase.from('s1_filter_items').delete().eq('id', itemId);
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const keepItems = items.filter((item) => item.should_keep);
  const removeItems = items.filter((item) => !item.should_keep);

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
            <div className="step-badge">Bước 1 / 5</div>
            <h1 className="step-title">S1 - Sàng lọc</h1>
            <p className="step-subtitle">Giữ cái cần, bỏ cái thừa</p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/area/${areaName}/s2`)}
          >
            Tiếp theo: S2 →
          </button>
        </div>

        <div className="step-content">
          <div className="instruction-card card">
            <h2>Làm gì ở bước này?</h2>
            <p>
              Liệt kê những gì bạn đang có trong lĩnh vực{' '}
              <strong>{currentArea?.display_name}</strong>. Sau đó quyết định:
            </p>
            <ul>
              <li>Cái nào cần GIỮ LẠI</li>
              <li>Cái nào nên BỎ ĐI</li>
            </ul>
            <p className="instruction-note">
              Ví dụ: Suy nghĩ tiêu cực, thói quen xấu, công việc không cần thiết,
              mối quan hệ độc hại...
            </p>
          </div>

          <div className="action-card card">
            <h2>Thêm mục cần xem xét</h2>
            <div className="input-group">
              <input
                type="text"
                className="input"
                placeholder="Nhập điều gì đó bạn muốn xem xét..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem()}
              />
              <button className="btn btn-primary" onClick={addItem}>
                Thêm
              </button>
            </div>
          </div>

          <div className="items-section">
            <div className="items-column card">
              <h3 className="column-title keep">Giữ lại ({keepItems.length})</h3>
              <div className="items-list">
                {keepItems.length === 0 ? (
                  <p className="empty-message">Chưa có mục nào</p>
                ) : (
                  keepItems.map((item) => (
                    <div key={item.id} className="item-card keep">
                      <div className="item-text">{item.item_text}</div>
                      <div className="item-actions">
                        <button
                          className="btn-icon"
                          onClick={() => toggleKeep(item.id, false)}
                          title="Chuyển sang bỏ đi"
                        >
                          ❌
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => deleteItem(item.id)}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="items-column card">
              <h3 className="column-title remove">Bỏ đi ({removeItems.length})</h3>
              <div className="items-list">
                {removeItems.length === 0 ? (
                  <p className="empty-message">Chưa có mục nào</p>
                ) : (
                  removeItems.map((item) => (
                    <div key={item.id} className="item-card remove">
                      <div className="item-text">{item.item_text}</div>
                      <div className="item-actions">
                        <button
                          className="btn-icon"
                          onClick={() => toggleKeep(item.id, true)}
                          title="Chuyển sang giữ lại"
                        >
                          ✅
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => deleteItem(item.id)}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="navigation-footer">
            <button
              className="btn btn-ghost"
              onClick={() => navigate('/dashboard')}
            >
              ← Về trang chủ
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/area/${areaName}/s2`)}
            >
              Tiếp theo: S2 - Sắp xếp →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default S1Filter;
