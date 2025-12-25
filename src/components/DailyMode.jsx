import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from './Sidebar';
import './DailyMode.css';

function DailyMode({ userSession }) {
  const navigate = useNavigate();
  const [currentArea, setCurrentArea] = useState(null);
  const [lifeAreas, setLifeAreas] = useState([]);
  const [todayActions, setTodayActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: areas } = await supabase
      .from('life_areas')
      .select('*')
      .order('sort_order');

    setLifeAreas(areas || []);

    if (userSession?.current_area_id) {
      const area = areas?.find((a) => a.id === userSession.current_area_id);
      setCurrentArea(area);

      const today = new Date().toISOString().split('T')[0];
      const { data: actions } = await supabase
        .from('daily_actions')
        .select('*')
        .eq('session_id', userSession.session_id)
        .eq('area_id', userSession.current_area_id)
        .eq('action_date', today)
        .order('created_at');

      if (!actions || actions.length === 0) {
        await generateDailyActions(userSession.session_id, userSession.current_area_id, today);
        const { data: newActions } = await supabase
          .from('daily_actions')
          .select('*')
          .eq('session_id', userSession.session_id)
          .eq('area_id', userSession.current_area_id)
          .eq('action_date', today)
          .order('created_at');
        setTodayActions(newActions || []);
      } else {
        setTodayActions(actions);
      }
    }

    setLoading(false);
  }

  async function generateDailyActions(sessionId, areaId, date) {
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
        action_date: date,
        status: 'pending'
      });
    }
  }

  async function handleActionStatus(actionId, status) {
    await supabase
      .from('daily_actions')
      .update({ status })
      .eq('id', actionId);

    setTodayActions((prev) =>
      prev.map((action) =>
        action.id === actionId ? { ...action, status } : action
      )
    );
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const completedCount = todayActions.filter((a) => a.status === 'done').length;
  const totalCount = todayActions.length;

  return (
    <div className="daily-mode">
      <Sidebar
        currentArea={currentArea}
        lifeAreas={lifeAreas}
        userSession={userSession}
      />

      <div className="daily-main">
        <div className="daily-header">
          <div>
            <h1 className="daily-title">Chế độ hàng ngày</h1>
            <p className="daily-subtitle">
              {currentArea && (
                <>
                  {currentArea.emoji} {currentArea.display_name}
                </>
              )}
            </p>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/dashboard')}
          >
            ← Về trang chủ
          </button>
        </div>

        <div className="daily-content">
          <div className="daily-intro card">
            <h2>Ngày mới, bắt đầu nhẹ nhàng</h2>
            <p>
              Chọn 1-2 việc để làm hôm nay. Không cần làm hết. Quan trọng là làm
              đều đặn, không áp lực.
            </p>
          </div>

          {totalCount > 0 && (
            <div className="progress-section card">
              <div className="progress-header">
                <span className="progress-label">Tiến độ hôm nay</span>
                <span className="progress-count">
                  {completedCount} / {totalCount}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="actions-section">
            <h2>Hành động hôm nay</h2>
            {todayActions.length === 0 ? (
              <div className="card">
                <p className="empty-message">Không có hành động nào cho hôm nay.</p>
              </div>
            ) : (
              <div className="actions-list">
                {todayActions.map((action) => (
                  <div
                    key={action.id}
                    className={`action-card card ${action.status}`}
                  >
                    <div className="action-content">
                      <div className="action-text">{action.action_text}</div>
                      {action.status === 'done' && (
                        <div className="action-status done">Hoàn thành</div>
                      )}
                      {action.status === 'skipped' && (
                        <div className="action-status skipped">Đã bỏ qua</div>
                      )}
                    </div>
                    {action.status === 'pending' && (
                      <div className="action-buttons">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleActionStatus(action.id, 'done')}
                        >
                          Hoàn thành
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => handleActionStatus(action.id, 'skipped')}
                        >
                          Bỏ qua
                        </button>
                      </div>
                    )}
                    {action.status !== 'pending' && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleActionStatus(action.id, 'pending')}
                      >
                        Đặt lại
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="daily-tips card">
            <h3>Gợi ý cho ngày hôm nay</h3>
            <ul>
              <li>Bắt đầu với việc nhỏ nhất</li>
              <li>Không cần hoàn hảo, chỉ cần làm</li>
              <li>Nếu mệt, nghỉ ngơi là hợp lý</li>
              <li>Mỗi ngày 1% tốt hơn là đủ</li>
            </ul>
          </div>

          <div className="daily-navigation">
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/area/${currentArea?.name}/s1`)}
            >
              Đi đến 5 bước →
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/review')}
            >
              Rà soát tuần →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyMode;
