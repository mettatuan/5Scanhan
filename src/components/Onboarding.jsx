import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getSessionId } from '../lib/session';
import './Onboarding.css';

function Onboarding({ onComplete }) {
  const [lifeAreas, setLifeAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLifeAreas();
  }, []);

  async function loadLifeAreas() {
    const { data, error } = await supabase
      .from('life_areas')
      .select('*')
      .order('sort_order');

    if (error) {
      console.error('Error loading life areas:', error);
    } else {
      setLifeAreas(data || []);
    }

    setLoading(false);
  }

  async function handleComplete() {
    if (!selectedArea) return;

    const sessionId = getSessionId();

    const { error: sessionError } = await supabase
      .from('user_sessions')
      .upsert({
        session_id: sessionId,
        current_area_id: selectedArea.id,
        current_step: 's1',
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id'
      });

    if (sessionError) {
      console.error('Error saving session:', sessionError);
      return;
    }

    await generateInitialDailyActions(sessionId, selectedArea.id);

    onComplete();
  }

  async function generateInitialDailyActions(sessionId, areaId) {
    const today = new Date().toISOString().split('T')[0];

    const actions = [
      'Xác định 1 thứ không cần thiết và loại bỏ',
      'Làm rõ 1 ưu tiên quan trọng nhất hôm nay',
      'Dành 5 phút suy ngẫm về điều gì đang làm bạn cảm thấy nặng nề'
    ];

    for (const actionText of actions) {
      await supabase.from('daily_actions').insert({
        session_id: sessionId,
        area_id: areaId,
        action_text: actionText,
        action_date: today,
        status: 'pending'
      });
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="onboarding">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h1 className="onboarding-title">5S cho bản thân</h1>
          <p className="onboarding-subtitle">Rõ ràng - Nhẹ nhàng - Bền vững</p>
        </div>

        <div className="onboarding-content">
          <div className="onboarding-message">
            <h2>Chào mừng bạn</h2>
            <p>
              Đây là công cụ giúp bạn áp dụng 5S vào cuộc sống cá nhân - không phải
              để làm nhiều hơn, mà để sống rõ ràng và nhẹ nhàng hơn.
            </p>
          </div>

          <div className="onboarding-instruction">
            <div className="instruction-box">
              <h3>Đừng làm tất cả cùng lúc</h3>
              <p>
                Chọn <strong>MỘT</strong> lĩnh vực để bắt đầu. Áp dụng 5S từng
                bước trong 7 ngày, rồi mở rộng sang lĩnh vực khác.
              </p>
            </div>
          </div>

          <div className="area-selection">
            <h3>Bạn muốn cải thiện lĩnh vực nào trước?</h3>
            <div className="area-grid">
              {lifeAreas.map((area) => (
                <button
                  key={area.id}
                  className={`area-card ${
                    selectedArea?.id === area.id ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedArea(area)}
                >
                  <span className="area-emoji">{area.emoji}</span>
                  <span className="area-name">{area.display_name}</span>
                  <span className="area-description">{area.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="onboarding-footer">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleComplete}
              disabled={!selectedArea}
            >
              Bắt đầu với {selectedArea?.display_name || '...'}
            </button>
            <p className="onboarding-note">
              Bạn có thể thay đổi lĩnh vực bất cứ lúc nào
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
