import { useAppStore } from '../store/useAppStore';
import { getWOD } from '../data/workouts';
import { Trophy, Zap, Clock, Target, Timer as TimerIcon, Wand2, Shield, Sparkles, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import bannerImg from '../assets/hero_banner_new.png';
import { calculateDynamicPunches, getUserRank } from '../utils/workoutUtils';

export default function Dashboard() {
  const {
    totalWorkoutsCompleted,
    punchesThrownEst,
    completedDates,
    lastWorkoutId,
    workoutPace,
    activities,
    isPro,
    setProModalOpen
  } = useAppStore();
  const wod = getWOD(isPro);
  const navigate = useNavigate();

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Rise and grind, Champ!";
    if (hour < 18) return "Afternoon work? Let's go!";
    return "Late night session? Empty the tank!";
  };

  const calculateStreak = () => {
    if (completedDates.length === 0) return 0;
    const sortedDates = [...new Set(completedDates.map(d => d.split('T')[0]))].sort().reverse();
    let streak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let lastDate = new Date(sortedDates[0]);
    lastDate.setHours(0, 0, 0, 0);

    // If last workout was not today or yesterday, streak is 0
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) return 0;

    streak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const d1 = new Date(sortedDates[i]);
      const d2 = new Date(sortedDates[i + 1]);
      const diff = Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const getCompletedDays = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const distToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now);
    monday.setDate(monday.getDate() - distToMonday);
    monday.setHours(0, 0, 0, 0);

    const completed = [false, false, false, false, false, false, false];
    completedDates.forEach(d => {
      const date = new Date(d);
      if (date >= monday) {
        const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
        completed[dayIndex] = true;
      }
    });
    return completed;
  };
  const completedDays = getCompletedDays();
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <div className="content-wrapper">
      <div className="hero-banner">
        <img src={bannerImg} alt="Boxer" className="hero-image" />
        <div className="hero-overlay" />

        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
          <button
            onClick={() => navigate('/settings')}
            className="header-action sidebar-redundant"
            style={{
              background: 'rgba(0,0,0,0.4)',
              borderColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          >
            <Settings size={22} />
          </button>
        </div>

        <div className="hero-content">
          <span className="hero-subtitle">Dashboard</span>
          <h1 className="hero-title">{getWelcomeMessage()}</h1>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '6px 12px', borderRadius: '12px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
              Rank: {getUserRank(punchesThrownEst).title}
            </span>
          </div>
        </div>
      </div>
      <section className="animate-in" style={{ animationDelay: '0.05s', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Leveling: {getUserRank(punchesThrownEst).title}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
              {getUserRank(punchesThrownEst).nextTitle ? `Next: ${getUserRank(punchesThrownEst).nextTitle}` : 'Max Level'}
            </span>
          </div>

          <div className="progress-bar-outer" style={{ height: '10px', marginBottom: '12px', background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="progress-bar-inner"
              style={{
                width: `${Math.min(100, Math.max(0, getUserRank(punchesThrownEst).progress * 100))}%`,
                background: 'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                boxShadow: '0 0 10px rgba(var(--accent-primary-rgb), 0.3)'
              }}
            />
          </div>

          <div className="flex-between">
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {getUserRank(punchesThrownEst).nextTierAt ? (getUserRank(punchesThrownEst).nextTierAt! - punchesThrownEst).toLocaleString() + ' punches to level up' : 'Ultimate Champion'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 800 }}>
              {Math.round(getUserRank(punchesThrownEst).progress * 100)}%
            </span>
          </div>

          {totalWorkoutsCompleted === 0 && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Ready to climb the ranks? Start your first workout!</p>
              <button
                className="btn-primary spring-press"
                style={{ fontSize: '0.85rem', width: '100%', padding: '12px' }}
                onClick={() => navigate('/workouts')}
              >
                Begin Your Journey
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="progress-section animate-in" style={{ animationDelay: '0.1s' }}>
        <div className="progress-header">
          <h2 className="heading-m" style={{ margin: 0 }}>Weekly Progress</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent-secondary)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
              <Zap size={14} fill="currentColor" /> {streak} DAY STREAK
            </span>
            <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '0.9rem' }}>
              {completedDays.filter(Boolean).length}/7 DAYS
            </span>
          </div>
        </div>

        <div className="progress-bar-outer">
          <div
            className="progress-bar-inner"
            style={{ width: `${(completedDays.filter(Boolean).length / 7) * 100}%` }}
          />
        </div>

        <div className="progress-grid">
          {days.map((day, i) => (
            <div key={i} className={`day-circle ${completedDays[i] ? 'completed' : ''} ${i === todayIndex ? 'today' : ''}`}>
              {day}
            </div>
          ))}
        </div>
      </section>

      <section className="wod-card animate-in" style={{ animationDelay: '0.15s' }}>
        <div className="flex-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Workout of the Day</span>
            <h2 className="heading-m" style={{ margin: '8px 0' }}>{wod.title}</h2>
            <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {wod.duration}m</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Target size={14} /> {wod.difficulty}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={14} /> ~{calculateDynamicPunches(wod, workoutPace)}</span>
            </div>
          </div>
          <Trophy color="var(--accent-secondary)" size={32} />
        </div>
        <button
          className="btn-primary spring-press"
          style={{ marginTop: '20px' }}
          onClick={() => navigate('/workout/' + wod.id)}
        >
          Start WOD
        </button>
      </section>

      {!isPro && (
        <section className="animate-in" style={{ animationDelay: '0.2s', marginBottom: '24px' }}>
          <div
            className="card spring-press"
            onClick={() => setProModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.05) 100%)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              borderRadius: '16px'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: 'rgba(255, 215, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFD700'
            }}>
              <Shield size={24} fill="currentColor" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#fff' }}>Upgrade to Pro</span>
                <Sparkles size={12} color="#FFD700" />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>Unlock the AI ComboCoach, custom rounds, history, social sharing and more!</p>
            </div>
            <div style={{ background: '#FFD700', borderRadius: '8px', padding: '6px 12px', fontSize: '0.7rem', fontWeight: '900', color: '#000' }}>
              GO PRO
            </div>
          </div>
        </section>
      )}

      <section className="stat-grid animate-in" style={{ animationDelay: '0.3s' }}>
        <div className="stat-item">
          <span className="stat-value">{totalWorkoutsCompleted}</span>
          <span className="stat-label">Workouts</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{punchesThrownEst.toLocaleString()}</span>
          <span className="stat-label">Est. Punches</span>
        </div>
      </section>

      {activities.length > 0 && (
        <section className="animate-in" style={{ animationDelay: '0.35s', marginBottom: '32px' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h2 className="heading-m" style={{ margin: 0 }}>Recent Session</h2>
            <button
              onClick={() => navigate('/activity')}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}
            >
              See All
            </button>
          </div>
          <div className="workout-item" style={{ marginBottom: 0 }}>
            <div className="workout-info">
              <span className="stat-label" style={{ fontSize: '0.65rem' }}>{new Date(activities[0].timestamp).toLocaleDateString()}</span>
              <h3 style={{ fontSize: '0.9rem', marginTop: '4px' }}>{activities[0].title}</h3>
              <div className="workout-meta">
                <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{activities[0].punches} Punches</span>
              </div>
            </div>
            <div className="header-action" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
              <Clock size={16} />
            </div>
          </div>
        </section>
      )}

      <section className="animate-in" style={{ animationDelay: '0.4s', paddingBottom: '40px' }}>
        <h2 className="heading-m" style={{ marginBottom: '16px' }}>Quick Actions</h2>
        <div className="quick-actions">
          <button className="btn-secondary spring-press" onClick={() => navigate('/ai-workout')}>
            <Wand2 size={18} /> AI ComboCoach
          </button>
          <button className="btn-secondary spring-press" onClick={() => navigate('/timer')}>
            <TimerIcon size={18} /> Round Timer
          </button>
          <button className="btn-secondary spring-press" onClick={() => navigate(lastWorkoutId ? `/workout/${lastWorkoutId}` : '/workouts')}>
            <Zap size={18} /> Last Drill
          </button>
        </div>
      </section>
    </div>
  );
}
