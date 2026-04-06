import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { PlusCircle, TrendingUp, Calendar, Settings, Trophy, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ShareWorkout } from '../components/ShareWorkout';
import { Paywall } from '../components/Paywall';

import { getUserRank } from '../utils/workoutUtils';

export default function Activity() {
  const { totalWorkoutsCompleted, punchesThrownEst, activities, addManualActivity } = useAppStore();
  const [manualPunches, setManualPunches] = useState('');
  const navigate = useNavigate();

  const handleManualAdd = () => {
    const val = parseInt(manualPunches);
    if (!isNaN(val) && val > 0) {
      if (val > 100000) {
        alert("Maximum 100,000 punches per manual entry for data integrity. Please log multiple sessions if needed.");
        return;
      }
      addManualActivity(val);
      setManualPunches('');
    }
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="activity-page">
      <div className="page-header">
        <h1 className="heading-xl">Activity</h1>
        <button 
          onClick={() => navigate('/settings')}
          className="header-action sidebar-redundant"
        >
          <Settings size={22} />
        </button>
      </div>
      
      <div className="stat-grid" style={{ marginBottom: '16px' }}>
        <div className="stat-item" style={{ gridColumn: 'span 2' }}>
           <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={16} /> Total Progress</span>
           <div className="flex-between" style={{ alignItems: 'flex-end', marginTop: '12px' }}>
              <div>
                 <span className="stat-value">{totalWorkoutsCompleted}</span>
                 <span className="stat-label">Sessions</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                 <span className="stat-value">{punchesThrownEst.toLocaleString()}</span>
                 <span className="stat-label">Punches</span>
              </div>
           </div>
        </div>

        <div className="stat-item">
           <span className="stat-value">{(totalWorkoutsCompleted * 30 / 60).toFixed(1)}</span>
           <span className="stat-label">Hours Fought</span>
        </div>
        
        <div className="stat-item">
           <span className="stat-value">{totalWorkoutsCompleted * 8}</span>
           <span className="stat-label">Total Rounds</span>
        </div>
      </div>

      <section className="animate-in" style={{ animationDelay: '0.1s', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Current Rank: {getUserRank(punchesThrownEst).title}
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
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Ready to climb the ranks? Perform your first workout!</p>
              <button 
                className="btn-primary spring-press" 
                style={{ fontSize: '0.85rem', width: '100%', padding: '12px' }} 
                onClick={() => navigate('/workouts')}
              >
                Start Training
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="card" style={{ marginBottom: '32px' }}>
         <h2 className="heading-m" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
           <PlusCircle size={20} color="var(--accent-primary)" />
           Log Manual Punches
         </h2>
         <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Did some bag work or a class without the app?
         </p>
         <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="number"
              placeholder="e.g. 1200"
              value={manualPunches}
              onChange={(e) => setManualPunches(e.target.value)}
              style={{
                flex: 1,
                background: 'var(--bg-app)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '12px',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <button 
              className="btn-primary" 
              style={{ width: 'auto', padding: '12px 24px' }}
              onClick={handleManualAdd}
            >
              Add
            </button>
         </div>
      </section>

      <div className="activity-history">
        <h2 className="heading-m" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} /> History
        </h2>
        
        {(() => {
          const isPro = useAppStore.getState().isPro;
          if (!isPro) {
            return (
              <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                 <Paywall 
                    title="Workout History" 
                    description="Track every session and share your progress with the world. Unlock elite history logs."
                    feature="History & Social Sharing"
                 />
              </div>
            );
          }

          if (activities.length === 0) {
            return (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <Target size={40} style={{ opacity: 0.2 }} />
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>No activity yet</div>
                    <div style={{ fontSize: '0.9rem' }}>Complete a workout to see your progress here.</div>
                  </div>
              </div>
            );
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activities.map((activity) => (
                <div key={activity.id} className="history-item card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px', 
                    background: activity.type === 'manual' ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 107, 107, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: activity.type === 'manual' ? 'var(--accent-secondary)' : 'var(--accent-primary)'
                  }}>
                    {activity.type === 'manual' ? <PlusCircle size={24} /> : <Trophy size={24} />}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '1rem' }}>{activity.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatTimestamp(activity.timestamp)}</div>
                  </div>
                  
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main)' }}>+{activity.punches}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Punches</div>
                    </div>
                    <ShareWorkout activity={activity} variant="icon" />
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
