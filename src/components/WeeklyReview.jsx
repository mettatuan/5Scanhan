import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from './Sidebar';
import './WeeklyReview.css';

function WeeklyReview({ userSession }) {
  const navigate = useNavigate();
  const [currentArea, setCurrentArea] = useState(null);
  const [lifeAreas, setLifeAreas] = useState([]);
  const [currentReview, setCurrentReview] = useState(null);
  const [pastReviews, setPastReviews] = useState([]);
  const [whatClearer, setWhatClearer] = useState('');
  const [whatLighter, setWhatLighter] = useState('');
  const [whatAdjust, setWhatAdjust] = useState('');
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

      const weekStart = getWeekStart();
      const { data: review } = await supabase
        .from('weekly_reviews')
        .select('*')
        .eq('session_id', userSession.session_id)
        .eq('week_start_date', weekStart)
        .maybeSingle();

      if (review) {
        setCurrentReview(review);
        setWhatClearer(review.what_clearer || '');
        setWhatLighter(review.what_lighter || '');
        setWhatAdjust(review.what_adjust || '');
      }

      const { data: past } = await supabase
        .from('weekly_reviews')
        .select('*')
        .eq('session_id', userSession.session_id)
        .order('week_start_date', { ascending: false })
        .limit(5);

      setPastReviews(past || []);
    }

    setLoading(false);
  }

  function getWeekStart() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  async function saveReview() {
    const weekStart = getWeekStart();

    if (currentReview) {
      await supabase
        .from('weekly_reviews')
        .update({
          what_clearer: whatClearer,
          what_lighter: whatLighter,
          what_adjust: whatAdjust
        })
        .eq('id', currentReview.id);
    } else {
      const { data } = await supabase
        .from('weekly_reviews')
        .insert({
          session_id: userSession.session_id,
          week_start_date: weekStart,
          what_clearer: whatClearer,
          what_lighter: whatLighter,
          what_adjust: whatAdjust
        })
        .select()
        .single();

      setCurrentReview(data);
    }

    loadData();
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="weekly-review">
      <Sidebar
        currentArea={currentArea}
        lifeAreas={lifeAreas}
        userSession={userSession}
      />

      <div className="review-main">
        <div className="review-header">
          <div>
            <h1 className="review-title">Rà soát tuần</h1>
            <p className="review-subtitle">
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

        <div className="review-content">
          <div className="review-intro card">
            <h2>Một tuần đã qua</h2>
            <p>
              Dành 5-10 phút để nhìn lại tuần vừa rồi. Không cần dài, chỉ cần
              thành thật với bản thân.
            </p>
            <p className="review-note">
              Không có đúng sai. Không có điểm số. Chỉ có sự nhận diện và điều
              chỉnh nhẹ nhàng.
            </p>
          </div>

          <div className="review-form">
            <div className="review-question card">
              <h3>Điều gì trở nên rõ ràng hơn?</h3>
              <p className="question-hint">
                Ví dụ: Tôi nhận ra ưu tiên thực sự của mình, tôi hiểu rõ hơn về
                thói quen nào cần thay đổi...
              </p>
              <textarea
                className="textarea"
                placeholder="Ghi lại điều bạn nhận ra..."
                value={whatClearer}
                onChange={(e) => setWhatClearer(e.target.value)}
                rows={4}
              />
            </div>

            <div className="review-question card">
              <h3>Điều gì cảm thấy nhẹ nhàng hơn?</h3>
              <p className="question-hint">
                Ví dụ: Tôi không còn lo lắng về việc X, tôi cảm thấy thoải mái
                hơn khi làm Y...
              </p>
              <textarea
                className="textarea"
                placeholder="Ghi lại điều bạn cảm thấy nhẹ nhàng..."
                value={whatLighter}
                onChange={(e) => setWhatLighter(e.target.value)}
                rows={4}
              />
            </div>

            <div className="review-question card">
              <h3>Điều gì cần điều chỉnh?</h3>
              <p className="question-hint">
                Ví dụ: Tôi cần giảm thời gian làm X, tôi muốn thử cách tiếp cận Y
                tuần sau...
              </p>
              <textarea
                className="textarea"
                placeholder="Ghi lại điều bạn muốn điều chỉnh..."
                value={whatAdjust}
                onChange={(e) => setWhatAdjust(e.target.value)}
                rows={4}
              />
            </div>

            <button className="btn btn-primary btn-lg" onClick={saveReview}>
              Lưu rà soát tuần
            </button>
          </div>

          {pastReviews.length > 0 && (
            <div className="past-reviews">
              <h2>Các tuần trước</h2>
              <div className="reviews-list">
                {pastReviews.map((review) => (
                  <PastReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PastReviewCard({ review }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const date = new Date(review.week_start_date).toLocaleDateString('vi-VN');

  return (
    <div className="past-review-card card">
      <div
        className="past-review-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="review-date">Tuần bắt đầu: {date}</span>
        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="past-review-content">
          {review.what_clearer && (
            <div className="review-section">
              <strong>Rõ ràng hơn:</strong>
              <p>{review.what_clearer}</p>
            </div>
          )}
          {review.what_lighter && (
            <div className="review-section">
              <strong>Nhẹ nhàng hơn:</strong>
              <p>{review.what_lighter}</p>
            </div>
          )}
          {review.what_adjust && (
            <div className="review-section">
              <strong>Cần điều chỉnh:</strong>
              <p>{review.what_adjust}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WeeklyReview;
