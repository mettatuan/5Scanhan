import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from './Sidebar';
import './StepPages.css';

function S5Sustain({ userSession }) {
  const { areaName } = useParams();
  const navigate = useNavigate();
  const [currentArea, setCurrentArea] = useState(null);
  const [lifeAreas, setLifeAreas] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [newWhy, setNewWhy] = useState('');
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
      const { data: remindersList } = await supabase
        .from('s5_sustain_reminders')
        .select('*')
        .eq('session_id', userSession.session_id)
        .eq('area_id', area.id)
        .order('created_at', { ascending: false });

      setReminders(remindersList || []);
    }

    setLoading(false);
  }

  async function addReminder() {
    if (!newWhy.trim()) return;

    const { data, error } = await supabase
      .from('s5_sustain_reminders')
      .insert({
        session_id: userSession.session_id,
        area_id: currentArea.id,
        why_text: newWhy.trim()
      })
      .select()
      .single();

    if (!error && data) {
      setReminders([data, ...reminders]);
      setNewWhy('');
    }
  }

  async function deleteReminder(reminderId) {
    await supabase.from('s5_sustain_reminders').delete().eq('id', reminderId);
    setReminders((prev) => prev.filter((item) => item.id !== reminderId));
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
            <div className="step-badge">Bước 5 / 5</div>
            <h1 className="step-title">S5 - Tâm thế</h1>
            <p className="step-subtitle">Giữ kỷ luật bền vững</p>
          </div>
        </div>

        <div className="step-content">
          <div className="instruction-card card">
            <h2>Làm gì ở bước này?</h2>
            <p>
              Đây là bước cuối cùng - và quan trọng nhất. Để giữ được 5S lâu dài,
              bạn cần nhắc nhở bản thân:
            </p>
            <ul>
              <li>Tại sao điều này quan trọng với tôi?</li>
              <li>Lợi ích gì tôi nhận được khi kiên trì?</li>
              <li>Tôi muốn cảm thấy thế nào?</li>
            </ul>
            <p className="instruction-note">
              Không phải động lực tạm thời, mà là lý do sâu xa giúp bạn giữ vững
              trong thời gian dài.
            </p>
          </div>

          <div className="action-card card">
            <h2>Lý do của bạn</h2>
            <div className="input-group-vertical">
              <textarea
                className="textarea"
                placeholder="Tại sao bạn muốn cải thiện lĩnh vực này? Điều gì thực sự quan trọng với bạn?"
                value={newWhy}
                onChange={(e) => setNewWhy(e.target.value)}
              />
              <button className="btn btn-primary" onClick={addReminder}>
                Lưu lý do
              </button>
            </div>
          </div>

          <div className="reminders-list">
            <h2>Các lý do của bạn</h2>
            {reminders.length === 0 ? (
              <div className="card">
                <p className="empty-message">
                  Chưa có lý do nào. Hãy ghi lại lý do quan trọng nhất.
                </p>
              </div>
            ) : (
              reminders.map((reminder) => (
                <div key={reminder.id} className="reminder-card card">
                  <button
                    className="btn-icon delete reminder-delete"
                    onClick={() => deleteReminder(reminder.id)}
                    title="Xóa"
                  >
                    🗑️
                  </button>
                  <div className="reminder-icon">💡</div>
                  <div className="reminder-text">{reminder.why_text}</div>
                </div>
              ))
            )}
          </div>

          <div className="completion-message card">
            <h2>Chúc mừng!</h2>
            <p>
              Bạn đã hoàn thành 5 bước của phương pháp 5S. Giờ đây, hãy:
            </p>
            <ul>
              <li>Thực hành mỗi ngày với chế độ "Hàng ngày"</li>
              <li>Rà soát mỗi tuần với "Rà soát tuần"</li>
              <li>Kiên trì, nhẹ nhàng, không áp lực</li>
            </ul>
          </div>

          <div className="navigation-footer">
            <button
              className="btn btn-ghost"
              onClick={() => navigate(`/area/${areaName}/s4`)}
            >
              ← S4: Tiêu chuẩn
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/dashboard')}
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default S5Sustain;
