import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WORKOUTS } from '../data/workouts';
import { playBell, playTenSecWarning, playRoundEndBell, playTick, playCountdownTap } from '../utils/audio';
import { translateCombination, calculateDynamicPunches, isWarmup } from '../utils/workoutUtils';
import { Capacitor } from '@capacitor/core';
import { useAppStore } from '../store/useAppStore';
import { X, Pause, Play, Mic, Music } from 'lucide-react';
import { ShareWorkout } from '../components/ShareWorkout';

type Phase = 'Idle' | 'Prepare' | 'Work' | 'Rest' | 'Finished';

export default function ActiveWorkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { aiWorkout, customWorkouts } = useAppStore();
  const workout = id === 'ai-generated' 
    ? aiWorkout 
    : (WORKOUTS.find(w => w.id === id) || customWorkouts.find((w) => w.id === id));

  const incrementWorkout = useAppStore(state => state.incrementWorkout);
  const combinationMode = useAppStore(state => state.combinationMode);
  const stance = useAppStore(state => state.stance);
  const voiceCommandsEnabled = useAppStore(state => state.voiceCommandsEnabled);
  const hapticsEnabled = useAppStore(state => state.hapticsEnabled);
  const workoutPace = useAppStore(state => state.workoutPace);
  const setWorkoutPace = useAppStore(state => state.setWorkoutPace);
  const randomizedCombosStatus = useAppStore(state => state.randomizedCombos);
  const burnoutModeStatus = useAppStore(state => state.burnoutMode);
  const visualRhythmEnabled = useAppStore(state => state.visualRhythm);
  const isPro = useAppStore(state => state.isPro);
  const selectedMusicProvider = useAppStore(state => state.selectedMusicProvider);

  const randomizedCombos = (isWarmup(workout) || workout?.id === 'ai-generated') ? false : randomizedCombosStatus;
  const burnoutModeEnabled = isWarmup(workout) ? false : burnoutModeStatus;

  const PACE_STEPS = [15, 20, 30, 45, 60];

  const [phase, setPhase] = useState<Phase>('Prepare');
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(20); // 20s prep
  const [isRunning, setIsRunning] = useState(true);
  const [comboIndex, setComboIndex] = useState(() => {
    if (!workout || !randomizedCombosStatus) return 0;
    const initialCombos = workout.roundCombinations && workout.roundCombinations.length > 0 
      ? workout.roundCombinations[0] 
      : workout.combinations;
    if (initialCombos.length <= 1) return 0;
    return Math.floor(Math.random() * initialCombos.length);
  });
  
  const getActiveCombos = (roundIndex: number) => {
    if (workout?.roundCombinations && workout.roundCombinations.length > 0) {
      // roundIndex is 0-based. Use modulo to loop back to the first set 
      // if there are more rounds in the workout than defined combination rounds.
      return workout.roundCombinations[roundIndex % workout.roundCombinations.length];
    }
    return workout?.combinations || [];
  };

  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    if (!workout) {
      navigate('/workouts');
      return;
    }

    startWakeLock();

    return () => {
      releaseWakeLock();
    };
  }, []);

  useEffect(() => {
    let timer: any;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        if (timeLeft === 10 && phase === 'Work') {
          playTenSecWarning();
        }

        if (timeLeft <= 4 && timeLeft > 0 && (phase === 'Prepare' || phase === 'Rest')) {
          playCountdownTap(timeLeft === 1);
        }

        setTimeLeft(t => t - 1);
        
        const nextTime = timeLeft - 1;
        if (phase === 'Work' && nextTime > 0 && nextTime % workoutPace === 0 && nextTime !== (workout?.roundLength || 0)) {
          playTick();
          const activeCombos = getActiveCombos(currentRound - 1);
          if (randomizedCombos) {
            let nextIndex = Math.floor(Math.random() * activeCombos.length);
            // Non-sequential randomness: Ensure we don't repeat the same combo immediately 
            // if there are more than 1 options
            if (activeCombos.length > 1) {
              while (nextIndex === comboIndex) {
                nextIndex = Math.floor(Math.random() * activeCombos.length);
              }
            }
            setComboIndex(nextIndex);
          } else {
            setComboIndex(prev => (prev + 1) % activeCombos.length);
          }
        }
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handlePhaseEnd();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, phase]);

  // Voice Commands Logic
  const recognitionRef = useRef<any>(null);
  const lastCommandTime = useRef<number>(0);
  const COMMAND_COOLDOWN = 1500; // ms between commands
  
  // Use a ref to always have the latest state in the voice handler without restarting the effect
  const stateRef = useRef({ 
    phase, isRunning, workoutPace, randomizedCombos, comboIndex, workout, hapticsEnabled 
  });
  
  useEffect(() => {
    stateRef.current = { 
      phase, isRunning, workoutPace, randomizedCombos, comboIndex, workout, hapticsEnabled 
    };
  }, [phase, isRunning, workoutPace, randomizedCombos, comboIndex, workout, hapticsEnabled]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!voiceCommandsEnabled || !SpeechRecognition) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const now = Date.now();
        if (now - lastCommandTime.current < COMMAND_COOLDOWN) return;

        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript.toLowerCase();
        }

        const { 
          phase: currentPhase, 
          isRunning: currentIsRunning, 
          workoutPace: currentPace, 
          randomizedCombos: currentRandom,
          comboIndex: currentIndex,
          hapticsEnabled: currentHaptics
        } = stateRef.current;

        // --- COMMANDS ---
        
        // NEXT / SKIP / GO
        if (transcript.includes('next') || transcript.includes('skip') || transcript.includes('go')) {
          lastCommandTime.current = now;
          if (currentPhase === 'Work') {
            const activeCombos = getActiveCombos(currentRound - 1);
            if (currentRandom && activeCombos.length > 1) {
              let nextIndex = Math.floor(Math.random() * activeCombos.length);
              while (nextIndex === currentIndex) {
                nextIndex = Math.floor(Math.random() * activeCombos.length);
              }
              setComboIndex(nextIndex);
            } else {
              setComboIndex(prev => (prev + 1) % activeCombos.length);
            }
          } else if (currentPhase === 'Prepare' || currentPhase === 'Rest') {
            setTimeLeft(0); // Jump to next phase
          }
          if (currentHaptics && 'vibrate' in navigator) navigator.vibrate(100);
        }

        // PREVIOUS / BACK
        if (transcript.includes('previous') || transcript.includes('back')) {
          lastCommandTime.current = now;
          if (currentPhase === 'Work') {
            const activeCombos = getActiveCombos(currentRound - 1);
            if (currentRandom && activeCombos.length > 1) {
              let prevIndex = Math.floor(Math.random() * activeCombos.length);
              while (prevIndex === currentIndex) {
                prevIndex = Math.floor(Math.random() * activeCombos.length);
              }
              setComboIndex(prevIndex);
            } else {
              setComboIndex(prev => (prev - 1 + activeCombos.length) % activeCombos.length);
            }
            if (currentHaptics && 'vibrate' in navigator) navigator.vibrate(100);
          }
        }

        // PAUSE / STOP / BREAK
        if (transcript.includes('pause') || transcript.includes('stop') || transcript.includes('break')) {
          lastCommandTime.current = now;
          if (currentIsRunning) {
            setIsRunning(false);
            if (currentHaptics && 'vibrate' in navigator) navigator.vibrate(200);
          }
        }

        // RESUME / START / CONTINUE
        if (transcript.includes('resume') || transcript.includes('start') || transcript.includes('continue')) {
          lastCommandTime.current = now;
          if (!currentIsRunning) {
            setIsRunning(true);
            if (currentHaptics && 'vibrate' in navigator) navigator.vibrate(200);
          }
        }

        // FASTER / SPEED UP
        if (isPro && (transcript.includes('faster') || transcript.includes('speed up') || transcript.includes('increase pace'))) {
          lastCommandTime.current = now;
          const cIndex = PACE_STEPS.indexOf(currentPace);
          if (cIndex > 0) {
            setWorkoutPace(PACE_STEPS[cIndex - 1]);
            if (currentHaptics && 'vibrate' in navigator) navigator.vibrate([50, 50, 50]);
          }
        }

        // SLOWER / SLOW DOWN
        if (isPro && (transcript.includes('slower') || transcript.includes('slow down') || transcript.includes('decrease pace'))) {
          lastCommandTime.current = now;
          const cIndex = PACE_STEPS.indexOf(currentPace);
          if (cIndex < PACE_STEPS.length - 1) {
            setWorkoutPace(PACE_STEPS[cIndex + 1]);
            if (currentHaptics && 'vibrate' in navigator) navigator.vibrate(200);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        if (voiceCommandsEnabled && stateRef.current.phase !== 'Finished' && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
      
      try {
        recognition.start();
      } catch (err) {
        console.error('Speech recognition failed to start:', err);
      }
    }

    return () => {
      if (recognitionRef.current) {
        const rec = recognitionRef.current;
        recognitionRef.current = null;
        rec.stop();
      }
    };
  }, [voiceCommandsEnabled]); // Only restart if voice commands are toggled on/off



  const startWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch {}
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  const handlePhaseEnd = () => {
    if (phase === 'Prepare') {
      setPhase('Work');
      setTimeLeft(workout?.roundLength || 180);
    } else if (phase === 'Work') {
      playRoundEndBell();
      if (currentRound < (workout?.rounds || 1)) {
        setPhase('Rest');
        setTimeLeft(workout?.restBetweenRounds || 60);
      } else {
        setPhase('Finished');
        setIsRunning(false);
        const dynamicPunches = calculateDynamicPunches(workout, workoutPace);
        incrementWorkout(dynamicPunches, workout?.id, workout?.title);
        releaseWakeLock();
      }
    } else if (phase === 'Rest') {
      playBell();
      setPhase('Work');
      setCurrentRound(r => r + 1);
      setTimeLeft(workout?.roundLength || 180);
      const activeCombos = getActiveCombos(currentRound); // next round
      if (randomizedCombos && activeCombos.length > 1) {
        setComboIndex(Math.floor(Math.random() * activeCombos.length));
      } else {
        setComboIndex(0);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (phase === 'Finished') {
    const dynamicPunches = calculateDynamicPunches(workout, workoutPace);
    const finishedActivity = {
      id: Math.random().toString(36).substring(7),
      type: 'workout' as const,
      title: workout?.title || 'Boxing Session',
      punches: dynamicPunches,
      timestamp: new Date().toISOString(),
      duration: (workout?.rounds || 0) * (workout?.roundLength || 0)
    };

    return (
      <div className="completed-state" style={{ background: 'var(--gradient-dark)' }}>
        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '340px' }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            background: 'rgba(34, 197, 94, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '32px',
            border: '2px solid var(--accent-success)',
            color: 'var(--accent-success)',
            boxShadow: '0 0 30px rgba(34, 197, 94, 0.2)'
          }}>
            <Play size={48} fill="currentColor" style={{ marginLeft: '4px' }} />
          </div>
          <h1 className="heading-xl font-heading" style={{ color: 'var(--accent-success)', letterSpacing: '2px', textAlign: 'center' }}>SESSION COMPLETE</h1>
          <p className="completed-subtitle font-heading" style={{ fontSize: '1.2rem', letterSpacing: '4px', marginTop: '8px', textAlign: 'center' }}>WELL DONE, CHAMP.</p>
          
          <div className="glass-card" style={{ padding: '32px', borderRadius: '16px', marginTop: '48px', width: '100%' }}>
            <div className="stat-label font-heading" style={{ textAlign: 'center', marginBottom: '8px' }}>Total Est. Punches</div>
            <div className="completed-stats font-heading" style={{ fontSize: '4rem', color: '#fff', textAlign: 'center' }}>{dynamicPunches}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '48px' }}>
            <button className="btn-primary completed-btn font-heading spring-press" onClick={() => navigate('/activity', { replace: true })} style={{ marginTop: 0 }}>
              View Activity log
            </button>
            <ShareWorkout activity={finishedActivity} />
          </div>

          <button className="font-heading spring-press" onClick={() => navigate('/', { replace: true })} style={{ marginTop: '32px', background: 'none', border: 'none', color: 'var(--text-muted)', letterSpacing: '2px', fontSize: '0.8rem' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
            onClick={() => navigate(-1)}
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
            onClick={() => setIsRunning(!isRunning)}
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

          {selectedMusicProvider !== 'none' && Capacitor.isNativePlatform() && (
            <button 
              className="spring-press flex-center landscape-pause-header"
              onClick={() => {
                let url = '';
                if (selectedMusicProvider === 'spotify') url = 'spotify://';
                if (selectedMusicProvider === 'apple') url = 'music://';
                if (selectedMusicProvider === 'youtube') url = 'youtubemusic://';
                window.open(url, '_blank');
              }}
              style={{ 
                background: 'rgba(239, 68, 68, 0.2)', 
                border: '1px solid rgba(239, 68, 68, 0.5)',
                color: 'var(--accent-primary)', 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%',
                cursor: 'pointer'
              }}
            >
              <Music size={20} />
            </button>
          )}

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
                  <>LISTENING: <strong style={{ color: '#fff' }}>"NEXT"</strong></>
                ) : (
                  <>SAY <strong style={{ color: '#fff' }}>"RESUME"</strong></>
                )}
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div className="font-heading" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '1px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{workout?.title}</div>
          <div className="flex-center" style={{ gap: '16px' }}>
             <div className="font-heading" style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', lineHeight: 1 }}>
               RD {currentRound}<span style={{ opacity: 0.3, margin: '0 4px', fontSize: '1.2rem' }}>/</span><span style={{ opacity: 0.5, fontSize: '1.2rem' }}>{workout?.rounds || 0}</span>
             </div>
             <div className="round-dots-grid">
                {Array.from({ length: workout?.rounds || 0 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="round-dot"
                    style={{ 
                      background: i + 1 < currentRound ? 'var(--accent-primary)' : i + 1 === currentRound ? '#fff' : 'rgba(255,255,255,0.15)',
                      boxShadow: i + 1 === currentRound ? '0 0 8px rgba(255,255,255,0.8)' : 'none'
                    }} 
                  />
                ))}
             </div>
          </div>
        </div>
      </div>

      <div className="workout-content-container">
        <div className="timer-column">
          <div className="timer-wrapper">
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
                strokeWidth="3.5"
                strokeDasharray="289"
                strokeDashoffset={289 - (289 * (timeLeft / (phase === 'Work' ? (workout?.roundLength || 1) : (phase === 'Prepare' ? 20 : (workout?.restBetweenRounds || 1)))))}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
              />
            </svg>
            <div className="phase-label font-heading" style={{ 
              color: phase === 'Work' ? 'var(--accent-primary)' : 'var(--accent-info)', 
              opacity: 0.8,
              zIndex: 1
            }}>{phase}</div>
            <div className="timer-display" style={{ 
              zIndex: 1,
              transition: 'all 0.3s ease',
              transform: isRunning && timeLeft <= 5 ? 'scale(1.05)' : 'scale(1)'
            }}>{formatTime(timeLeft)}</div>
          </div>
          
          <button className="pause-btn landscape-pause spring-press" onClick={() => setIsRunning(!isRunning)} style={{ display: 'none' }}>
            {isRunning ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />}
          </button>
        </div>

        <div className="info-column">
          {phase === 'Work' ? (
            <div className={`combo-container ${burnoutModeEnabled && currentRound === workout.rounds && timeLeft <= 30 ? 'burnout-active' : ''}`} style={{ padding: '20px 24px', borderRadius: '16px' }}>
               {burnoutModeEnabled && currentRound === workout.rounds && timeLeft <= 30 ? (
                 <div className="burnout-content animate-in">
                    <div className="burnout-label font-heading">BURNOUT PHASE</div>
                    <div className="burnout-main-text font-heading">NON-STOP 1 - 2s</div>
                    <div className="burnout-sub-text font-heading">EMPTY THE TANK!</div>
                 </div>
               ) : (
                 <>
                  <div className="combo-label font-heading" style={{ letterSpacing: '4px', opacity: 1 }}>
                      {isWarmup(workout)?'Exercise':'Current Combo'}
                  </div>
                  <div className={`combo-text ${combinationMode === 'text' ? 'text-mode' : 'number-mode'} ${visualRhythmEnabled ? 'visual-rhythm' : ''}`}>
                      {visualRhythmEnabled && !isWarmup(workout) ? (
                        <div className="rhythm-spans" key={comboIndex}>
                           {(combinationMode === 'text' 
                             ? translateCombination(getActiveCombos(currentRound - 1)[comboIndex], stance) 
                             : getActiveCombos(currentRound - 1)[comboIndex]
                           ).split(' - ').map((part: string, idx: number, arr: string[]) => (
                             <span 
                                key={idx} 
                                className="rhythm-part"
                                style={{ 
                                  // Added + 1 to shift the first punch by one beat
                                  animationDelay: `${(idx + 1) * 0.5}s`,
                                  // Added + 2 to accommodate the leading rest beat and a trailing rest beat
                                  animationDuration: `${(arr.length + 2) * 0.5}s`,
                                  animationPlayState: isRunning ? 'running' : 'paused'
                                }}
                             >
                               {part}{idx < arr.length - 1 ? ' - ' : ''}
                             </span>
                           ))}
                        </div>
                      ) : (
                        combinationMode === 'text' 
                          ? translateCombination(getActiveCombos(currentRound - 1)[comboIndex], stance) 
                          : getActiveCombos(currentRound - 1)[comboIndex]
                      )}
                  </div>

                  {getActiveCombos(currentRound - 1).length > 1 && timeLeft > workoutPace && (
                    <div className="combo-progress-section" style={{ width: '100%', marginTop: '16px' }}>
                        <div className="combo-progress-container">
                          <div 
                              className="combo-progress-bar" 
                              style={{ 
                                width: `${(( (timeLeft > (workout.roundLength - (workout.roundLength % workoutPace || workoutPace)) ? (workout.roundLength % workoutPace || workoutPace) : workoutPace) - ((timeLeft - 1) % workoutPace + 1)) / (timeLeft > (workout.roundLength - (workout.roundLength % workoutPace || workoutPace)) ? (workout.roundLength % workoutPace || workoutPace) : workoutPace)) * 100}%` 
                              }}
                          />
                        </div>
                    </div>
                  )}

                  {getActiveCombos(currentRound - 1).length > 1 && (
                    <div className="coming-up-container">
                        <div className="coming-up-label font-heading" style={{ letterSpacing: '2px', fontSize: '0.8rem' }}>Coming Up</div>
                        <div className="coming-up-text font-heading" style={{ textTransform: randomizedCombos ? 'uppercase' : 'none' }}>
                          {timeLeft <= workoutPace ? (
                            currentRound < (workout?.rounds || 1) ? 'Rest Break' : 'Workout Complete'
                          ) : (
                            randomizedCombos ? (
                              <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>Random Combo</span>
                            ) : (
                              combinationMode === 'text' 
                                ? translateCombination(getActiveCombos(currentRound - 1)[(comboIndex + 1) % getActiveCombos(currentRound - 1).length], stance) 
                                : getActiveCombos(currentRound - 1)[(comboIndex + 1) % getActiveCombos(currentRound - 1).length]
                            )
                          )}
                        </div>
                    </div>
                  )}
                 </>
               )}
            </div>
          ) : (
             <div className="prepare-container glass-card" style={{ padding: '32px 24px', borderRadius: '16px' }}>
                <div className="prepare-label font-heading" style={{ color: phase === 'Prepare' ? 'var(--accent-primary)' : 'var(--accent-info)', letterSpacing: '3px', fontSize: '0.8rem' }}>
                  {phase === 'Prepare' ? 'Prepare' : 'Rest Phase'}
                </div>
                <div className="prepare-main-text font-heading" style={{ fontSize: '2rem' }}>
                  {phase === 'Prepare' ? 'Get Ready Champ' : 'Next: Round ' + (currentRound + 1)}
                </div>
                
                 <div className="first-combo-preview">
                   <div className="coming-up-label font-heading" style={{ fontSize: '0.7rem', letterSpacing: '2px' }}>
                      Next Up: {isWarmup(workout)?'Exercise':'Combination'}
                   </div>
                   <div className="first-combo-text font-heading">
                      {randomizedCombos ? (
                        <span style={{ color: 'var(--accent-primary)' }}>SHUFFLED / RANDOM</span>
                      ) : (
                        combinationMode === 'text' 
                         ? translateCombination(getActiveCombos(phase === 'Prepare' ? 0 : currentRound)[0], stance) 
                         : getActiveCombos(phase === 'Prepare' ? 0 : currentRound)[0]
                      )}
                   </div>
                </div>
             </div>
          )}
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
                  <>LISTENING: <strong style={{ color: '#fff' }}>"NEXT"</strong></>
                ) : (
                  <>SAY <strong style={{ color: '#fff' }}>"RESUME"</strong></>
                )}
              </span>
            </div>
          )}
          <button className="pause-btn footer-pause spring-press" onClick={() => setIsRunning(!isRunning)} style={{ width: '80px', height: '80px' }}>
            {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
          </button>
      </div>
    </div>
  );
}
