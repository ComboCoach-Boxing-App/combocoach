import { Play, Pause, Settings, X, Mic } from 'lucide-react';
import { useTimerStore } from '../store/useTimerStore';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Lock } from 'lucide-react';

export default function Timer() {
  const navigate = useNavigate();
  const { 
    roundTime, setRoundTime, 
    restTime, setRestTime, 
    rounds, setRounds, 
    currentRound, timeLeft, 
    phase, isRunning, 
    startTimer, pauseTimer, stopTimer, setTimerData 
  } = useTimerStore();

  const voiceCommandsEnabled = useAppStore(state => state.voiceCommandsEnabled);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const presets = [
    { label: 'Beginner (3x2)', rd: 120, rs: 60, r: 3 },
    { label: 'Amateur (3x3)', rd: 180, rs: 60, r: 3 },
    { label: 'Pro (12x3)', rd: 180, rs: 60, r: 12 },
    { label: 'HIIT (10x1)', rd: 60, rs: 15, r: 10 },
  ];

  if (phase === 'Finished') {
    return (
      <div className="animate-in content-wrapper">
        <div className="completed-state">
          <h1 className="heading-xl">COMPLETED</h1>
          <p style={{ margin: '20px 0', color: 'var(--text-muted)' }}>Great work, Champ.</p>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Session Finished</div>
          <button className="btn-primary" style={{ marginTop: '40px' }} onClick={stopTimer}>
            Back to Timer
          </button>
        </div>
      </div>
    );
  }

  if (phase !== 'Idle') {
    return (
      <div className={`timer-overlay ${phase === 'Work' ? 'timer-state-work' : 'timer-state-rest'}`}>
        <div className="workout-bg-glow">
          <div 
            className={`${phase === 'Work' ? 'glow-work' : 'glow-rest'} ${isRunning && timeLeft <= 10 && phase === 'Work' ? 'animate-pulse-glow' : ''}`}
          ></div>
        </div>

        <div className="flex-between workout-header" style={{ padding: '24px 32px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              className="spring-press flex-center"
              onClick={stopTimer}
              style={{ 
                background: 'rgba(255,255,255,0.08)', 
                border: 'none', 
                color: '#fff', 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%',
                cursor: 'pointer'
              }}
            >
              <X size={24} />
            </button>

            <button 
              className="spring-press flex-center landscape-pause-header"
              onClick={() => isRunning ? pauseTimer() : startTimer()}
              style={{ 
                background: 'rgba(255,255,255,0.08)', 
                border: 'none', 
                color: '#fff', 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%',
                cursor: 'pointer'
              }}
            >
              {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />}
            </button>

            {voiceCommandsEnabled && (
              <div className="voice-command-hint glass-card landscape-header-hint" style={{ 
                padding: '12px 20px', 
                borderRadius: '100px', 
                border: '1px solid var(--border-bright)',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginLeft: '4px',
                position: 'relative'
              }}>
                {isRunning && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '-4px', 
                    left: '12px', 
                    background: 'var(--accent-primary)', 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%',
                    boxShadow: '0 0 10px var(--accent-primary)',
                    animation: 'dot-pulse 1s infinite'
                  }} />
                )}
                <Mic size={16} color={isRunning ? 'var(--accent-primary)' : 'var(--text-muted)'} className={isRunning ? 'animate-pulse' : ''} />
                <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px' }}>
                  {isRunning ? (
                    <>LISTENING: <strong style={{ color: '#fff' }}>"PAUSE"</strong></>
                  ) : (
                    <>SAY <strong style={{ color: '#fff' }}>"RESUME"</strong></>
                  )}
                </span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <div className="font-heading" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '1px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>CUSTOM TIMER</div>
            <div className="flex-center" style={{ gap: '16px' }}>
               <div className="font-heading" style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', lineHeight: 1 }}>
                 RD {currentRound}<span style={{ opacity: 0.3, margin: '0 4px', fontSize: '1.2rem' }}>/</span><span style={{ opacity: 0.5, fontSize: '1.2rem' }}>{rounds}</span>
               </div>
               <div className="round-dots-grid">
                  {Array.from({ length: rounds }).map((_, i) => (
                    <div 
                      key={i} 
                      className="round-dot"
                      style={{ 
                        background: i + 1 < currentRound ? 'var(--accent-primary)' : i + 1 === currentRound ? '#fff' : 'rgba(255,255,255,0.15)',
                        boxShadow: i + 1 === currentRound ? '0 0 8px rgba(255,255,255,0.8)' : 'none',
                      }} 
                    />
                  ))}
               </div>
            </div>
          </div>
        </div>

        <div className="workout-content-container" style={{ justifyContent: 'center' }}>
          <div className="timer-column" style={{ width: '100%', maxWidth: '600px' }}>
            <div className="timer-wrapper" style={{ width: 'min(80vw, 500px)', height: 'min(80vw, 500px)' }}>
              <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', position: 'absolute', width: '100%', height: '100%' }}>
                <circle
                  cx="50" cy="50" r="46"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="2"
                />
                <circle
                  cx="50" cy="50" r="46"
                  fill="none"
                  stroke={phase === 'Work' ? 'var(--accent-primary)' : 'var(--accent-info)'}
                  strokeWidth="2.5"
                  strokeDasharray="289"
                  strokeDashoffset={289 - (289 * (timeLeft / (phase === 'Work' ? roundTime : (phase === 'Prepare' ? 20 : restTime))))}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
                />
              </svg>
              <div className="phase-label font-heading" style={{ 
                color: phase === 'Work' ? 'var(--accent-primary)' : 'var(--accent-info)', 
                opacity: 0.8,
                zIndex: 1,
                fontSize: 'min(5vw, 2rem)',
                top: '20%'
              }}>{phase}</div>
              <div className="timer-display" style={{ 
                zIndex: 1,
                transition: 'all 0.3s ease',
                transform: isRunning && timeLeft <= 5 ? 'scale(1.05)' : 'scale(1)',
                fontSize: 'min(20vw, 12rem)',
                margin: 0
              }}>{formatTime(timeLeft)}</div>
            </div>
            
            <button className="pause-btn landscape-pause spring-press" onClick={() => isRunning ? pauseTimer() : startTimer()} style={{ display: 'none' }}>
              {isRunning ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />}
            </button>
          </div>
        </div>

        <div className="workout-footer" style={{ flexDirection: 'column', gap: '20px', alignItems: 'center', display: 'flex' }}>
            {voiceCommandsEnabled && (
              <div className="voice-command-hint glass-card portrait-only" style={{ 
                padding: '8px 16px', 
                borderRadius: '100px', 
                border: '1px solid var(--border-bright)',
                background: 'rgba(255,255,255,0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px',
                position: 'relative'
              }}>
                {isRunning && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '-2px', 
                    left: '12px', 
                    background: 'var(--accent-primary)', 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%',
                    boxShadow: '0 0 10px var(--accent-primary)',
                    animation: 'dot-pulse 1s infinite'
                  }} />
                )}
                <Mic size={14} color={isRunning ? 'var(--accent-primary)' : 'var(--text-muted)'} className={isRunning ? 'animate-pulse' : ''} />
                <span style={{ fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                  {isRunning ? (
                    <>LISTENING: <strong style={{ color: '#fff' }}>"PAUSE"</strong></>
                  ) : (
                    <>SAY <strong style={{ color: '#fff' }}>"RESUME"</strong></>
                  )}
                </span>
              </div>
            )}
            <button className="pause-btn footer-pause spring-press" onClick={() => isRunning ? pauseTimer() : startTimer()} style={{ width: '80px', height: '80px' }}>
              {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in content-wrapper">
      <div className="page-header">
        <h1 className="heading-xl">Timer</h1>
        <button 
          onClick={() => navigate('/settings')}
          className="header-action sidebar-redundant"
        >
          <Settings size={22} />
        </button>
      </div>
      
      <div className="control-group animate-in" style={{ animationDelay: '0.1s', opacity: useAppStore.getState().isPro ? 1 : 0.5 }}>
        <div className="control-label">
          <span>Round Duration {!useAppStore.getState().isPro && <Lock size={12} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />}</span>
          <span style={{ fontSize: '1.2rem' }}>{formatTime(roundTime)}</span>
        </div>
        <input className="range-slider" type="range" min="15" max="600" step="15" value={roundTime} onChange={(e) => setRoundTime(Number(e.target.value))} disabled={!useAppStore.getState().isPro} />
      </div>

      <div className="control-group animate-in" style={{ animationDelay: '0.15s', opacity: useAppStore.getState().isPro ? 1 : 0.5 }}>
        <div className="control-label">
          <span>Rest Duration {!useAppStore.getState().isPro && <Lock size={12} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />}</span>
          <span style={{ fontSize: '1.2rem' }}>{formatTime(restTime)}</span>
        </div>
        <input className="range-slider" type="range" min="15" max="300" step="15" value={restTime} onChange={(e) => setRestTime(Number(e.target.value))} disabled={!useAppStore.getState().isPro} />
      </div>

      <div className="control-group animate-in" style={{ animationDelay: '0.2s', opacity: useAppStore.getState().isPro ? 1 : 0.5 }}>
        <div className="control-label">
          <span>Rounds {!useAppStore.getState().isPro && <Lock size={12} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />}</span>
          <span style={{ fontSize: '1.2rem' }}>{rounds}</span>
        </div>
        <input className="range-slider" type="range" min="1" max="20" step="1" value={rounds} onChange={(e) => setRounds(Number(e.target.value))} disabled={!useAppStore.getState().isPro} />
      </div>

      {!useAppStore.getState().isPro && (
        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#FFD700', marginBottom: '16px', fontWeight: '800', letterSpacing: '0.5px' }}>
          CUSTOM SLIDERS LOCKED • USE PRESETS BELOW OR GET PRO
        </div>
      )}

      <div className="preset-grid animate-in" style={{ animationDelay: '0.25s' }}>
        {presets.map((p) => (
          <div key={p.label} className="preset-btn spring-press" onClick={() => {
            setTimerData(p.rd, p.rs, p.r);
          }}>
            {p.label}
          </div>
        ))}
      </div>

      <button className="btn-primary spring-press animate-in" style={{ marginTop: '40px', animationDelay: '0.3s' }} onClick={startTimer}>
        <Play size={20} fill="currentColor" /> Start Session
      </button>
    </div>
  );
}
