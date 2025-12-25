import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Sidebar.css';

function Sidebar({ currentArea, lifeAreas, userSession }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function changeArea(area) {
    await supabase
      .from('user_sessions')
      .update({
        current_area_id: area.id,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', userSession.session_id);

    window.location.reload();
  }

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">5S Cá nhân</h2>
          <p className="sidebar-motto">Rõ - Nhẹ - Bền</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => {
              navigate('/dashboard');
              setIsOpen(false);
            }}
          >
            <span className="sidebar-icon">🏠</span>
            <span>Trang chủ</span>
          </button>

          <button
            className={`sidebar-link ${isActive('/daily') ? 'active' : ''}`}
            onClick={() => {
              navigate('/daily');
              setIsOpen(false);
            }}
          >
            <span className="sidebar-icon">☀️</span>
            <span>Hàng ngày</span>
          </button>

          <button
            className={`sidebar-link ${isActive('/review') ? 'active' : ''}`}
            onClick={() => {
              navigate('/review');
              setIsOpen(false);
            }}
          >
            <span className="sidebar-icon">📝</span>
            <span>Rà soát tuần</span>
          </button>
        </nav>

        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <span>Lĩnh vực đang tập trung</span>
          </div>
          {currentArea && (
            <div className="current-area">
              <span className="area-icon">{currentArea.emoji}</span>
              <span className="area-name">{currentArea.display_name}</span>
            </div>
          )}
        </div>

        {currentArea && (
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span>5 bước</span>
            </div>
            <nav className="sidebar-nav">
              <button
                className={`sidebar-link ${
                  isActive(`/area/${currentArea.name}/s1`) ? 'active' : ''
                }`}
                onClick={() => {
                  navigate(`/area/${currentArea.name}/s1`);
                  setIsOpen(false);
                }}
              >
                <span className="sidebar-icon">1</span>
                <span>Sàng lọc</span>
              </button>
              <button
                className={`sidebar-link ${
                  isActive(`/area/${currentArea.name}/s2`) ? 'active' : ''
                }`}
                onClick={() => {
                  navigate(`/area/${currentArea.name}/s2`);
                  setIsOpen(false);
                }}
              >
                <span className="sidebar-icon">2</span>
                <span>Sắp xếp</span>
              </button>
              <button
                className={`sidebar-link ${
                  isActive(`/area/${currentArea.name}/s3`) ? 'active' : ''
                }`}
                onClick={() => {
                  navigate(`/area/${currentArea.name}/s3`);
                  setIsOpen(false);
                }}
              >
                <span className="sidebar-icon">3</span>
                <span>Sạch sẽ</span>
              </button>
              <button
                className={`sidebar-link ${
                  isActive(`/area/${currentArea.name}/s4`) ? 'active' : ''
                }`}
                onClick={() => {
                  navigate(`/area/${currentArea.name}/s4`);
                  setIsOpen(false);
                }}
              >
                <span className="sidebar-icon">4</span>
                <span>Tiêu chuẩn</span>
              </button>
              <button
                className={`sidebar-link ${
                  isActive(`/area/${currentArea.name}/s5`) ? 'active' : ''
                }`}
                onClick={() => {
                  navigate(`/area/${currentArea.name}/s5`);
                  setIsOpen(false);
                }}
              >
                <span className="sidebar-icon">5</span>
                <span>Tâm thế</span>
              </button>
            </nav>
          </div>
        )}

        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <span>Chuyển lĩnh vực</span>
          </div>
          <div className="area-list">
            {lifeAreas.map((area) => (
              <button
                key={area.id}
                className={`area-item ${
                  currentArea?.id === area.id ? 'current' : ''
                }`}
                onClick={() => {
                  changeArea(area);
                  setIsOpen(false);
                }}
                disabled={currentArea?.id === area.id}
              >
                <span className="area-icon">{area.emoji}</span>
                <span className="area-name">{area.display_name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}

export default Sidebar;
