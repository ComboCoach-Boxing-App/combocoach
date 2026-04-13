import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WORKOUTS } from '../data/workouts';
import type { Workout } from '../data/workouts';
import { Flame, Target, Play, Clock, Settings, Wand2, Zap, Sparkles, Hammer } from 'lucide-react';
import { HeavyBag, Shadowbox, BoxingPads } from '../components/Icons';
import { useAppStore } from '../store/useAppStore';
import { calculateDynamicPunches } from '../utils/workoutUtils';

type Modality = Workout['type'];

const difficultyOrder: Record<Workout['difficulty'], number> = {
  'Beginner': 1,
  'Intermediate': 2,
  'Advanced': 3
};

export default function Workouts() {
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<Modality | 'Custom' | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Workout['difficulty'] | 'All'>('All');
  const { workoutPace, isPro, customWorkouts } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredWorkouts = WORKOUTS
    .filter(w => (selectedType === 'All' || w.type === selectedType))
    .filter(w => (selectedDifficulty === 'All' || w.difficulty === selectedDifficulty))
    .sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);

  const modalities: { type: Modality | 'Custom'; label: string; icon: any }[] = [
    { type: 'Custom', label: 'My Drills', icon: Sparkles },
    { type: 'Warming up', label: 'Warmup', icon: Flame },
    { type: 'Solo Bag', label: 'Heavy Bag', icon: HeavyBag },
    { type: 'Solo Shadowboxing', label: 'Shadowbox', icon: Shadowbox },
    { type: 'Pads Training', label: 'Pads', icon: BoxingPads },
  ];

  const renderSkeletons = () => (
    <div className="workout-list">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="workout-item skeleton" style={{ height: '100px', border: 'none', opacity: 0.15 }}></div>
      ))}
    </div>
  );


  return (
    <div className="content-wrapper">
      <div className="page-header">
        <div>
          <h1 className="heading-xl">Workouts</h1>
        </div>
        <button 
          onClick={() => navigate('/settings')}
          className="header-action sidebar-redundant"
        >
          <Settings size={22} />
        </button>
      </div>

      <div className="animate-in" style={{ animationDelay: '0.1s' }}>
        <div 
          className="workout-item spring-press" 
          onClick={() => navigate('/ai-workout')}
          style={{ 
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(9, 9, 11, 0.05) 100%)', 
            borderColor: 'rgba(239, 68, 68, 0.3)',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div className="workout-info" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ 
                fontSize: '10px', 
                background: 'rgba(239, 68, 68, 0.15)', 
                color: 'var(--accent-primary)', 
                padding: '2px 8px', 
                borderRadius: '100px', 
                textTransform: 'uppercase', 
                letterSpacing: '1px', 
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={10} /> AI POWERED
              </span>
            </div>
            <h3 style={{ marginTop: '8px', color: '#fff', fontSize: '1.2rem', letterSpacing: '0.5px' }}>AI ComboCoach</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Intelligent rounds, pace & focus</p>
          </div>
          <div
            style={{ 
              background: 'var(--gradient-primary)', 
              borderRadius: '14px',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)',
              position: 'relative',
              zIndex: 1
            }}
          >
            <Wand2 size={20} />
          </div>
        </div>

        <div 
          className="workout-item spring-press" 
          onClick={() => navigate('/workout/custom-builder')}
          style={{ 
            background: 'rgba(255, 255, 255, 0.02)', 
            borderColor: isPro ? 'rgba(255, 255, 255, 0.1)' : 'var(--border)', 
            marginTop: '12px',
            borderStyle: 'dashed',
            borderWidth: '1.5px'
          }}
        >
          <div className="workout-info">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ 
                fontSize: '10px', 
                color: isPro ? 'var(--text-muted)' : 'rgba(255,255,255,0.3)', 
                textTransform: 'uppercase', 
                letterSpacing: '1px', 
                fontWeight: 800,
                border: `1px solid ${isPro ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
                padding: '1px 6px',
                borderRadius: '4px'
              }}>
                {isPro ? 'Builder' : 'PRO FEATURE'}
              </span>
            </div>
            <h3 style={{ marginTop: '6px', color: isPro ? '#fff' : 'var(--text-muted)', fontSize: '1.1rem' }}>Custom Combo Builder</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Draft your own specific rounds</p>
          </div>
          <div
            style={{ 
              background: isPro ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)', 
              borderRadius: '12px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isPro ? 'var(--text-muted)' : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <Hammer size={18} />
          </div>
        </div>
      </div>

      {isPro && customWorkouts && customWorkouts.length > 0 && selectedType === 'All' && (
        <div className="animate-in" style={{ animationDelay: '0.12s', marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 className="heading-m" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>My Recent Drills</h2>
            <button 
              onClick={() => setSelectedType('Custom')}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 800 }}
            >
              SEE ALL
            </button>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            overflowX: 'auto', 
            paddingBottom: '8px',
            margin: '0 -16px',
            paddingLeft: '16px',
            paddingRight: '16px',
            scrollbarWidth: 'none'
          }} className="no-scrollbar">
            {[...customWorkouts].reverse().slice(0, 5).map((w: any) => (
              <div 
                key={w.id} 
                className="workout-item spring-press" 
                onClick={() => navigate(`/workout/${w.id}`)}
                style={{ 
                  flex: '0 0 240px', 
                  marginBottom: 0, 
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <div className="workout-info">
                  <span style={{ fontSize: '9px', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 900 }}>{w.rounds} Rounds</span>
                  <h3 style={{ fontSize: '0.9rem', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.title}</h3>
                </div>
                <div
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    borderRadius: '8px',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
                  }}
                >
                  <Play size={14} fill="currentColor" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="animate-in" style={{ height: '1px', background: 'var(--border)', margin: '24px 0', animationDelay: '0.15s' }} />

      <p className="animate-in" style={{ color: 'var(--text-muted)', marginBottom: '16px', animationDelay: '0.18s', fontSize: '0.9rem' }}>Choose your mode.</p>

      <div className="modality-grid animate-in" style={{ animationDelay: '0.2s' }}>
        {modalities.map(({ type, label, icon: Icon }) => (
          <div 
            key={type} 
            className={`modality-card spring-press ${selectedType === type ? 'selected' : ''}`}
            onClick={() => setSelectedType(selectedType === type ? 'All' : type)}
          >
            <Icon size={24} color={selectedType === type ? 'var(--accent-primary)' : 'var(--text-muted)'} />
            <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{label}</span>
          </div>
        ))}
      </div>

      <div className="difficulty-filters animate-in" style={{ animationDelay: '0.3s' }}>
        {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
          <div 
            key={diff} 
            className={`difficulty-filter-pill spring-press ${selectedDifficulty === diff ? 'active' : ''} ${diff}`}
            onClick={() => setSelectedDifficulty(diff as any)}
          >
            {diff}
          </div>
        ))}
      </div>

      <div className="workout-list animate-in" style={{ animationDelay: '0.35s' }}>
        {loading ? (
          renderSkeletons()
        ) : (() => {
            const isPro = useAppStore.getState().isPro;
            
            let allAvailableWorkouts = [...filteredWorkouts];
            if (selectedType === 'Custom' || selectedType === 'All') {
              const customW = customWorkouts
                .map(w => ({ ...w, isCustom: true }))
                .filter(w => (selectedDifficulty === 'All' || w.difficulty === selectedDifficulty));
              
              if (selectedType === 'Custom') {
                allAvailableWorkouts = customW;
              }
            }

            const displayWorkouts = isPro ? allAvailableWorkouts : allAvailableWorkouts.filter(w => w.difficulty !== 'Advanced').slice(0, 3);
            
            if (displayWorkouts.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No workouts found for this type.
                </div>
              );
            }

            return (
              <>
                {displayWorkouts.map((w) => (
                  <div 
                    key={w.id} 
                    className="workout-item spring-press" 
                    onClick={() => navigate(`/workout/${w.id}`)}
                    style={w.isCustom ? { borderColor: 'rgba(239, 68, 68, 0.2)' } : {}}
                  >
                    <div className="workout-info">
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {w.isCustom ? (
                          <span style={{ fontSize: '11px', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>CUSTOM</span>
                        ) : (
                          <span className={`difficulty-pill difficulty-${w.difficulty}`}>{w.difficulty}</span>
                        )}
                        <span style={{ fontSize: '11px', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{w.focus}</span>
                      </div>
                      <h3 style={{ marginTop: '4px' }}>{w.title}</h3>
                      <div className="workout-meta">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Clock size={12} /> {w.duration}m</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Target size={12} /> {w.rounds} Rd</span>
                        {!w.isCustom && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Zap size={12} /> ~{calculateDynamicPunches(w, workoutPace)}</span>}
                      </div>
                    </div>
                    <div
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-primary)',
                      }}
                    >
                      <Play size={18} fill="currentColor" />
                    </div>
                  </div>
                ))}
                {!isPro && filteredWorkouts.length > 3 && (
                  <div 
                    className="card spring-press" 
                    onClick={() => useAppStore.getState().setProModalOpen(true)}
                    style={{ 
                      marginTop: '12px', 
                      textAlign: 'center', 
                      background: 'rgba(255, 215, 0, 0.05)', 
                      borderColor: 'rgba(255, 215, 0, 0.2)',
                      padding: '24px'
                    }}
                  >
                    <div style={{ color: '#FFD700', fontWeight: '800', fontSize: '0.9rem', marginBottom: '4px' }}>UNLOCK {filteredWorkouts.length - 3}+ MORE WORKOUTS</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Get Pro to access Advanced level and full library</div>
                  </div>
                )}
              </>
            );
          })()
        }
      </div>
    </div>
  );
}
