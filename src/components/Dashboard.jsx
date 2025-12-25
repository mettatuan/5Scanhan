import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from './Sidebar';
import './Dashboard.css';

function Dashboard({ userSession }) {
  const [currentArea, setCurrentArea] = useState(null);
  const [lifeAreas, setLifeAreas] = useState([]);
  const [todayActions, setTodayActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, [userSession]);

  async function loadDashboardData() {
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

      setTodayActions(actions || []);
    }

    setLoading(false);
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

  return (
    <div className="dashboard">
      <Sidebar
        currentArea={currentArea}
        lifeAreas={lifeAreas}
        userSession={userSession}
      />

      <div className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Tập trung hôm nay</h1>
            <p className="dashboard-subtitle">
              {currentArea && (
                <>
                  {currentArea.emoji} {currentArea.display_name}
                </>
              )}
            </p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/daily')}
          >
            Chế độ hàng ngày
          </button>
        </div>

        <div className="dashboard-content">
          <div className="welcome-card card">
            <h2>5S là gì?</h2>
            <div className="steps-overview">
              <div className="step-mini">
                <strong>S1 - Sàng lọc:</strong> Giữ cái cần, bỏ cái thừa
              </div>
              <div className="step-mini">
                <strong>S2 - Sắp xếp:</strong> Đặt đúng vị trí, ưu tiên rõ
              </div>
              <div className="step-mini">
                <strong>S3 - Sạch sẽ:</strong> Rà soát, làm sạch định kỳ
              </div>
              <div className="step-mini">
                <strong>S4 - Tiêu chuẩn:</strong> Tạo quy tắc đơn giản
              </div>
              <div className="step-mini">
                <strong>S5 - Tâm thế:</strong> Giữ kỷ luật bền vững
              </div>
            </div>
          </div>

          {todayActions.length > 0 && (
            <div className="today-actions card">
              <h2>Hành động hôm nay</h2>
              <p className="section-description">
                Chọn 1-2 việc để làm. Không áp lực.
              </p>
              <div className="action-list">
                {todayActions.map((action) => (
                  <div
                    key={action.id}
                    className={`action-item ${action.status}`}
                  >
                    <div className="action-text">{action.action_text}</div>
                    <div className="action-buttons">
                      {action.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() =>
                              handleActionStatus(action.id, 'done')
                            }
                          >
                            Hoàn thành
                          </button>
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() =>
                              handleActionStatus(action.id, 'skipped')
                            }
                          >
                            Bỏ qua
                          </button>
                        </>
                      )}
                      {action.status === 'done' && (
                        <span className="status-badge done">Đã xong</span>
                      )}
                      {action.status === 'skipped' && (
                        <span className="status-badge skipped">Đã bỏ qua</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="quick-start card">
            <h2>Bắt đầu với {currentArea?.display_name}</h2>
            <p className="section-description">
              Làm từng bước. Không cần vội.
            </p>
            <div className="step-grid">
              <button
                className="step-card"
                onClick={() => navigate(`/area/${currentArea?.name}/s1`)}
              >
                <div className="step-number">S1</div>
                <div className="step-title">Sàng lọc</div>
                <div className="step-desc">Giữ cái cần, bỏ cái thừa</div>
              </button>
              <button
                className="step-card"
                onClick={() => navigate(`/area/${currentArea?.name}/s2`)}
              >
                <div className="step-number">S2</div>
                <div className="step-title">Sắp xếp</div>
                <div className="step-desc">Đặt đúng vị trí</div>
              </button>
              <button
                className="step-card"
                onClick={() => navigate(`/area/${currentArea?.name}/s3`)}
              >
                <div className="step-number">S3</div>
                <div className="step-title">Sạch sẽ</div>
                <div className="step-desc">Rà soát định kỳ</div>
              </button>
              <button
                className="step-card"
                onClick={() => navigate(`/area/${currentArea?.name}/s4`)}
              >
                <div className="step-number">S4</div>
                <div className="step-title">Tiêu chuẩn</div>
                <div className="step-desc">Tạo quy tắc</div>
              </button>
              <button
                className="step-card"
                onClick={() => navigate(`/area/${currentArea?.name}/s5`)}
              >
                <div className="step-number">S5</div>
                <div className="step-title">Tâm thế</div>
                <div className="step-desc">Giữ kỷ luật</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
