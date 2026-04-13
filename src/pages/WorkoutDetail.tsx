import { useParams, useNavigate, Link } from 'react-router-dom';
import { WORKOUTS } from '../data/workouts';
import { useAppStore } from '../store/useAppStore';
import { translateCombination, calculateDynamicPunches, isWarmup } from '../utils/workoutUtils';
import { 
  ChevronLeft, 
  Play, 
  Clock, 
  Target, 
  Flame, 
  Settings as SettingsIcon,
  Zap,
  Info,
  Wand2,
  Volume2,
  Pencil,
  Trash2
} from 'lucide-react';
import { Shadowbox, HeavyBag, BoxingPads } from '../components/Icons';

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    workoutPace, 
    aiWorkout, 
    stance, 
    randomizedCombos, 
    toggleRandomizedCombos,
    burnoutMode,
    toggleBurnoutMode,
    isPro,
    setProModalOpen,
    customWorkouts,
    removeCustomWorkout
  } = useAppStore();

  const workout = id === 'ai-generated' 
    ? aiWorkout 
    : (WORKOUTS.find(w => w.id === id) || customWorkouts.find((w: any) => w.id === id));

  const isCustom = id?.startsWith('custom-');

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this custom workout?')) {
      removeCustomWorkout(id!);
      navigate('/workouts');
    }
  };

  const handleEdit = () => {
    navigate(`/workout/custom-builder?edit=${id}`);
  };

  if (!workout) {
    return (
      <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '16px' }}>
        <h2 className="heading-m">Workout not found</h2>
        <button className="btn-primary" onClick={() => navigate('/workouts')}>Go Back</button>
      </div>
    );
  }

  // Pro features check
  if (workout.difficulty === 'Advanced' && !isPro) {
    return (
      <div className="animate-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center' }}>
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center', borderRadius: '16px', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(255, 215, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#FFD700' }}>
            <Target size={32} />
          </div>
          <h2 className="heading-m" style={{ marginBottom: '12px' }}>Pro Workout</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>
            Advanced training sessions are part of ComboCoach Pro. Upgrade now for full access to the championship library.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <button className="btn-primary" onClick={() => setProModalOpen(true)}>UPGRADE TO PRO</button>
             <button className="btn-secondary" onClick={() => navigate('/workouts')}>GO BACK</button>
          </div>
        </div>
      </div>
    );
  }

  const dynamicPunches = calculateDynamicPunches(workout, workoutPace);

  const getTypeIcon = () => {
    switch (workout.type) {
      case 'Solo Bag': return <HeavyBag size={24} color="var(--accent-primary)" />;
      case 'Solo Shadowboxing': return <Shadowbox size={24} color="var(--accent-primary)" />;
      case 'Pads Training': return <BoxingPads size={24} color="var(--accent-primary)" />;
      case 'Warming up': return <Flame size={24} color="var(--accent-primary)" />;
      default: return <Target size={24} color="var(--accent-primary)" />;
    }
  };

  const getComboDescription = (combo: string) => {
    return translateCombination(combo, stance).replace(/ - /g, ' • ');
  };

  return (
    <div className="workout-detail-page animate-in content-wrapper">
      <div className="detail-header" style={{ position: 'relative', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button 
            onClick={() => navigate(-1)} 
            className="back-button spring-press"
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid var(--border)', 
              borderRadius: '12px', 
              padding: '8px', 
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={24} />
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {isCustom && (
              <>
                <button 
                  onClick={handleEdit}
                  className="back-button spring-press"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '12px', 
                    padding: '8px', 
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  <Pencil size={20} />
                </button>
                <button 
                  onClick={handleDelete}
                  className="back-button spring-press"
                  style={{ 
                    background: 'rgba(239, 68, 68, 0.05)', 
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '12px', 
                    padding: '8px', 
                    color: 'var(--accent-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
            <button 
              onClick={() => navigate(`/workout/${workout.id}/active`)}
              className="btn-primary spring-press"
              style={{ 
                width: 'auto',
                padding: '8px 16px',
                height: 'auto',
                fontSize: '0.8rem',
                borderRadius: '10px'
              }}
            >
              <Play fill="currentColor" size={14} />
              START
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
           {getTypeIcon()}
           <span style={{ color: 'var(--accent-primary)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {workout.type}
           </span>
        </div>
        
        <h1 className="heading-xl" style={{ marginBottom: '8px' }}>{workout.title}</h1>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <span className={`difficulty-pill difficulty-${workout.difficulty}`}>{workout.difficulty}</span>
          <span className="difficulty-pill" style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'var(--border)' }}>{workout.focus}</span>
        </div>

        <div className="stats-strip" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '12px',
          background: 'var(--bg-card)',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          marginBottom: '24px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Clock size={20} color="var(--text-muted)" style={{ marginBottom: '4px' }} />
            <div style={{ fontWeight: 800 }}>{workout.duration}m</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Target size={20} color="var(--text-muted)" style={{ marginBottom: '4px' }} />
            <div style={{ fontWeight: 800 }}>{workout.rounds}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rounds</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Zap size={20} color="var(--text-muted)" style={{ marginBottom: '4px' }} />
            <div style={{ fontWeight: 800 }}>{dynamicPunches}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Punches</div>
          </div>
        </div>

        {!isWarmup(workout) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div 
              onClick={toggleRandomizedCombos}
              className="spring-press"
              style={{
                padding: '12px',
                borderRadius: '16px',
                border: `1px solid ${randomizedCombos ? 'var(--accent-primary)' : 'var(--border)'}`,
                background: randomizedCombos ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer'
              }}
            >
              <Wand2 size={18} color={randomizedCombos ? 'var(--accent-primary)' : 'var(--text-muted)'} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: randomizedCombos ? 'var(--accent-primary)' : 'var(--text-muted)' }}>Random</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{randomizedCombos ? 'ON' : 'OFF'}</span>
              </div>
            </div>

            <div 
              onClick={toggleBurnoutMode}
              className="spring-press"
              style={{
                padding: '12px',
                borderRadius: '16px',
                border: `1px solid ${burnoutMode ? 'var(--accent-primary)' : 'var(--border)'}`,
                background: burnoutMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer'
              }}
            >
              <Volume2 size={18} color={burnoutMode ? 'var(--accent-primary)' : 'var(--text-muted)'} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: burnoutMode ? 'var(--accent-primary)' : 'var(--text-muted)' }}>Burnout</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{burnoutMode ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </div>
        )}

        <div className="pace-card" style={{
          background: 'linear-gradient(135deg, rgba(var(--accent-primary-rgb), 0.1) 0%, rgba(var(--accent-primary-rgb), 0.02) 100%)',
          border: '1px solid rgba(var(--accent-primary-rgb), 0.2)',
          padding: '16px 20px',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(var(--accent-primary-rgb), 0.1)', borderRadius: '12px' }}>
              <Clock size={20} color="var(--accent-primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Workout Pace</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Changes every {workoutPace}s</div>
            </div>
          </div>
          <Link to="/settings" style={{ 
            color: 'var(--accent-primary)', 
            textDecoration: 'none', 
            fontSize: '0.85rem', 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            Edit <SettingsIcon size={14} />
          </Link>
        </div>

        <div className="combinations-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <h2 className="heading-m" style={{ margin: 0 }}>Combinations</h2>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '8px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800 }}>
              {workout.combinations.length} DRILLS {burnoutMode && !isWarmup(workout) ? '+ BURNOUT' : ''}
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '100px' }}>
            {(randomizedCombos ? [...workout.combinations].sort(() => Math.random() - 0.5) : workout.combinations).map((combo: string, index: number) => (
              <div key={index} className="combo-detail-item" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{combo}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>#{index + 1}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Info size={14} />
                  <span>{getComboDescription(combo)}</span>
                </div>
              </div>
            ))}

            {burnoutMode && !isWarmup(workout) && (
              <div className="combo-detail-item burnout-list-item" style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                border: '1px dashed var(--accent-primary)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flame size={18} color="var(--accent-primary)" />
                    <span style={{ fontWeight: 900, color: 'var(--accent-primary)', fontSize: '1.1rem', textTransform: 'uppercase' }}>Burnout Phase</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 800 }}>FINAL ROUND</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Zap size={14} color="var(--accent-primary)" />
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>Non-stop 1 - 2s (Last 30s)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{
        position: 'fixed',
        bottom: '80px', // Above navbar if present
        left: '20px',
        right: '20px',
        zIndex: 100,
      }}>
        <button 
          className="btn-primary spring-press" 
          style={{ 
            width: '100%', 
            height: '60px', 
            fontSize: '1.1rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px',
            boxShadow: '0 10px 40px rgba(var(--accent-primary-rgb), 0.3)'
          }}
          onClick={() => navigate(`/workout/${workout.id}/active`)}
        >
          <Play fill="currentColor" size={24} />
          START TRAINING
        </button>
      </div>
    </div>
  );
}
