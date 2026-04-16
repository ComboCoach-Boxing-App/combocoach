import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Volume2, VolumeX, Vibrate, VibrateOff, Trash2, ArrowLeft, Type, Hash, Shield, Mic, MicOff, Timer, Wand2, Lock, Music, Smartphone, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LogIn, User as UserIcon } from 'lucide-react';

export default function Settings() {
  const { 
    hapticsEnabled, 
    soundEnabled, 
    voiceCommandsEnabled,
    combinationMode,
    stance,
    workoutPace,
    isPro,
    selectedMusicProvider,
    toggleHaptics, 
    toggleSound, 
    toggleVoiceCommands,
    toggleCombinationMode,
    toggleStance,
    setProModalOpen,
    randomizedCombos,
    toggleRandomizedCombos,
    burnoutMode,
    toggleBurnoutMode,
    visualRhythm,
    toggleVisualRhythm,
    setWorkoutPace,
    setMusicProvider,
    fullReset,
    addManualActivity
  } = useAppStore();
  const { user, isGuest, signOut } = useAuth();
  const navigate = useNavigate();
  const [manualPunches, setManualPunches] = useState('');

  const handleManualAdd = () => {
    const val = parseInt(manualPunches);
    if (!isNaN(val) && val > 0) {
      if (val > 100000) {
        alert("Maximum 100,000 punches per manual entry for data integrity. Please log multiple sessions if needed.");
        return;
      }
      addManualActivity(val);
      setManualPunches('');
      alert(`${val.toLocaleString()} punches added to history!`);
    }
  };

  const handleReset = async () => {
    if (window.confirm("ARE YOU SURE? This will permanently delete all history, settings, and API keys. This cannot be undone.")) {
      await fullReset();
      alert("Application has been fully reset.");
    }
  };

  return (
    <div className="animate-in content-wrapper">
      <div className="page-header">
        <h1 className="heading-xl">Settings</h1>
        <button 
          onClick={() => navigate(-1)}
          className="header-action"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      <div className="card animate-in" style={{ marginTop: '32px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h2 className="heading-m" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserIcon size={20} color="var(--accent-primary)" />
          Account Management
        </h2>
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1rem', fontWeight: '700' }}>
              {user ? 'Logged In' : 'Guest Mode'}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {user ? user.email : 'Free Tier Only. No Cloud Sync.'}
            </span>
          </div>
        </div>
        
        <button 
            className="btn-primary spring-press" 
            style={{ 
              background: user ? 'rgba(255, 255, 255, 0.05)' : 'var(--primary)', 
              color: user ? '#fff' : '#fff', 
              border: user ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              boxShadow: 'none'
            }}
            onClick={async () => {
              if (user) {
                if (window.confirm('Are you sure you want to sign out?')) {
                  await signOut();
                }
              } else {
                await signOut(); // This clears guest state
              }
            }}
          >
            {user ? <><LogOut size={18} /> Sign Out</> : <><LogIn size={18} /> Sign In / Register</>}
        </button>
      </div>

      <div className="card animate-in" style={{ marginTop: '24px', animationDelay: '0.1s' }}>
        <h2 className="heading-m" style={{ marginBottom: '24px', letterSpacing: '0.5px' }}>Preferences</h2>
        
        <div className="flex-between spring-press" style={{ marginBottom: '24px', cursor: 'pointer' }} onClick={toggleSound}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: soundEnabled ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)' }}>
              {soundEnabled ? <Volume2 size={22} color="var(--accent-primary)" /> : <VolumeX size={22} color="var(--text-muted)" />}
            </div>
            <span style={{ fontSize: '1rem', fontWeight: '700' }}>Sound Cues</span>
          </div>
          <div 
            style={{ 
              width: '50px', 
              height: '26px', 
              borderRadius: '16px', 
              background: soundEnabled ? 'var(--accent-primary)' : 'var(--bg-card-hover)',
              position: 'relative',
              transition: 'all 0.3s ease',
              pointerEvents: 'none'
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: '3px', 
              left: soundEnabled ? '27px' : '3px', 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              background: '#fff',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }} />
          </div>
        </div>

        <div className="flex-between spring-press" style={{ marginBottom: '24px', cursor: 'pointer' }} onClick={toggleHaptics}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: hapticsEnabled ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)' }}>
              {hapticsEnabled ? <Vibrate size={22} color="var(--accent-primary)" /> : <VibrateOff size={22} color="var(--text-muted)" />}
            </div>
            <span style={{ fontSize: '1rem', fontWeight: '700' }}>Haptic Feedback</span>
          </div>
          <div 
            style={{ 
              width: '50px', 
              height: '26px', 
              borderRadius: '16px', 
              background: hapticsEnabled ? 'var(--accent-primary)' : 'var(--bg-card-hover)',
              position: 'relative',
              transition: 'all 0.3s ease',
              pointerEvents: 'none'
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: '3px', 
              left: hapticsEnabled ? '27px' : '3px', 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              background: '#fff',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }} />
          </div>
        </div>

        <div className="flex-between spring-press" style={{ marginBottom: '24px', cursor: 'pointer' }} onClick={toggleVisualRhythm}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: visualRhythm ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)' }}>
              <Hash size={22} color={visualRhythm ? "var(--accent-primary)" : "var(--text-muted)"} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: '700' }}>Visual Rhythm Guide</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Punch-by-punch lighting</span>
            </div>
          </div>
          <div 
            style={{ 
              width: '50px', 
              height: '26px', 
              borderRadius: '16px', 
              background: visualRhythm ? 'var(--accent-primary)' : 'var(--bg-card-hover)',
              position: 'relative',
              transition: 'all 0.3s ease',
              pointerEvents: 'none'
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: '3px', 
              left: visualRhythm ? '27px' : '3px', 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              background: '#fff',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }} />
          </div>
        </div>

        <div className="spring-press" style={{ marginBottom: '24px', cursor: 'pointer' }} onClick={toggleVoiceCommands}>
          <div className="flex-between">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '10px', borderRadius: '12px', background: voiceCommandsEnabled ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)' }}>
                {voiceCommandsEnabled ? <Mic size={22} color="var(--accent-primary)" /> : <MicOff size={22} color="var(--text-muted)" />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '700' }}>Voice Commands</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hands-free workout control</span>
              </div>
            </div>
            <div 
              style={{ 
                width: '50px', 
                height: '26px', 
                borderRadius: '16px', 
                background: voiceCommandsEnabled ? 'var(--accent-primary)' : 'var(--bg-card-hover)',
                position: 'relative',
                transition: 'all 0.3s ease',
                pointerEvents: 'none'
              }}
            >
              <div style={{ 
                position: 'absolute', 
                top: '3px', 
                left: voiceCommandsEnabled ? '27px' : '3px', 
                width: '20px', 
                height: '20px', 
                borderRadius: '50%', 
                background: '#fff',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }} />
            </div>
          </div>
          
          {voiceCommandsEnabled && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px', 
                background: 'rgba(255, 255, 255, 0.03)', 
                borderRadius: '12px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--accent-primary)' }}>•</span> "Next Combo"
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--accent-primary)' }}>•</span> "Previous Combo"
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--accent-primary)' }}>•</span> "Pause Round"
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--accent-primary)' }}>•</span> "Resume Round"
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--accent-primary)' }}>•</span> 
                  <span style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                    "Faster" {!isPro && (
                      <span style={{ 
                        fontSize: '0.6rem', 
                        background: 'rgba(249, 115, 22, 0.1)', 
                        color: 'var(--accent-secondary)', 
                        padding: '1px 5px', 
                        borderRadius: '4px', 
                        fontWeight: '800',
                        border: '1px solid rgba(249, 115, 22, 0.2)'
                      }}>PRO</span>
                    )}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--accent-primary)' }}>•</span> 
                  <span style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                    "Slower" {!isPro && (
                      <span style={{ 
                        fontSize: '0.6rem', 
                        background: 'rgba(249, 115, 22, 0.1)', 
                        color: 'var(--accent-secondary)', 
                        padding: '1px 5px', 
                        borderRadius: '4px', 
                        fontWeight: '800',
                        border: '1px solid rgba(249, 115, 22, 0.2)'
                      }}>PRO</span>
                    )}
                  </span>
                </div>
              </div>
          )}
        </div>

        <div style={{ marginTop: '0', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)' }}>
              <Music size={22} color="var(--accent-primary)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: '700' }}>Music Sync</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick-launch your favorite music app</span>
            </div>
          </div>
          
          {Capacitor.isNativePlatform() ? (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '10px',
              padding: '4px'
            }}>
              {[
                { id: 'none', label: 'None' },
                { id: 'spotify', label: 'Spotify' },
                { id: 'apple', label: 'Apple Music' },
                { id: 'youtube', label: 'YT Music' }
              ].map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setMusicProvider(provider.id as any)}
                  className="spring-press"
                  style={{
                    flex: '1 1 80px',
                    padding: '12px 6px',
                    borderRadius: '12px',
                    border: '1px solid ' + (selectedMusicProvider === provider.id ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)'),
                    background: selectedMusicProvider === provider.id ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    color: selectedMusicProvider === provider.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    minHeight: '44px'
                  }}
                >
                  {provider.label}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ 
              padding: '16px', 
              borderRadius: '12px', 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px dashed rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'center'
            }}>
              <Smartphone size={24} color="var(--text-muted)" style={{ opacity: 0.5 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>Mobile App Only Feature</span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', lineHeight: '1.4' }}>
                  Install the ComboCoach app on iOS or Android for seamless music synchronization.
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      <div className="card animate-in" style={{ marginTop: '32px', animationDelay: '0.12s' }}>
        <h2 className="heading-m" style={{ marginBottom: '24px', letterSpacing: '0.5px' }}>Training Features</h2>

        <div className="flex-between spring-press" style={{ marginBottom: '24px', cursor: 'pointer' }} onClick={toggleCombinationMode}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)' }}>
              {combinationMode === 'text' ? <Type size={22} color="var(--accent-primary)" /> : <Hash size={22} color="var(--accent-primary)" />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: '700' }}>Combination Display</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{combinationMode === 'text' ? 'Names (Jab, Cross...)' : 'Numbers (1, 2, 3...)'}</span>
            </div>
          </div>
          <div 
            style={{ 
              width: '50px', 
              height: '26px', 
              borderRadius: '16px', 
              background: combinationMode === 'text' ? 'var(--accent-primary)' : 'var(--bg-card-hover)',
              position: 'relative',
              transition: 'all 0.3s ease',
              pointerEvents: 'none'
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: '3px', 
              left: combinationMode === 'text' ? '27px' : '3px', 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              background: '#fff',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }} />
          </div>
        </div>

        <div className="flex-between spring-press" style={{ marginBottom: '24px', cursor: 'pointer' }} onClick={toggleStance}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)' }}>
              <Shield size={22} color="var(--accent-primary)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: '700' }}>Fighting Stance</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{stance}</span>
            </div>
          </div>
          <div 
            style={{ 
              width: '50px', 
              height: '26px', 
              borderRadius: '16px', 
              background: stance === 'southpaw' ? 'var(--accent-primary)' : 'var(--bg-card-hover)',
              position: 'relative',
              transition: 'all 0.3s ease',
              pointerEvents: 'none'
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: '3px', 
              left: stance === 'southpaw' ? '27px' : '3px', 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              background: '#fff',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }} />
          </div>
        </div>

        <div style={{ marginTop: '0', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)' }}>
              <Timer size={22} color="var(--accent-primary)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: '700' }}>Combination Pace</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>How often to switch combinations</span>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '10px',
            padding: '4px'
          }}>
            {[15, 20, 30, 45, 60].map((pace) => (
              <button
                key={pace}
                onClick={() => setWorkoutPace(pace)}
                className="spring-press"
                style={{
                  flex: '1 1 60px',
                  padding: '12px 6px',
                  borderRadius: '12px',
                  border: '1px solid ' + (workoutPace === pace ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)'),
                  background: workoutPace === pace ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  color: workoutPace === pace ? 'var(--accent-primary)' : 'var(--text-muted)',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minHeight: '44px'
                }}
              >
                {pace}s
              </button>
            ))}
          </div>
        </div>

        <div className="flex-between spring-press" style={{ marginBottom: '24px', cursor: 'pointer', opacity: isPro ? 1 : 0.6 }} onClick={() => !isPro ? setProModalOpen(true) : toggleRandomizedCombos()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: randomizedCombos ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)' }}>
              {!isPro ? <Lock size={22} color="var(--text-muted)" /> : <Wand2 size={22} color={randomizedCombos ? "var(--accent-primary)" : "var(--text-muted)"} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Random Combinations {!isPro && <Lock size={12} />}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reaction training (no set patterns)</span>
            </div>
          </div>
          <div 
            style={{ 
              width: '50px', 
              height: '26px', 
              borderRadius: '16px', 
              background: randomizedCombos ? 'var(--accent-primary)' : 'var(--bg-card-hover)',
              position: 'relative',
              transition: 'all 0.3s ease',
              pointerEvents: 'none'
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: '3px', 
              left: randomizedCombos ? '27px' : '3px', 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              background: '#fff',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }} />
          </div>
        </div>

        <div className="flex-between spring-press" style={{ marginBottom: '8px', cursor: 'pointer' }} onClick={toggleBurnoutMode}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: burnoutMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)' }}>
              <Volume2 size={22} color={burnoutMode ? "var(--accent-primary)" : "var(--text-muted)"} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: '700' }}>Last Round Burnout</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max intensity final 30s</span>
            </div>
          </div>
          <div 
            style={{ 
              width: '50px', 
              height: '26px', 
              borderRadius: '16px', 
              background: burnoutMode ? 'var(--accent-primary)' : 'var(--bg-card-hover)',
              position: 'relative',
              transition: 'all 0.3s ease',
              pointerEvents: 'none'
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: '3px', 
              left: burnoutMode ? '27px' : '3px', 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              background: '#fff',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }} />
          </div>
        </div>
      </div>

      <div className="card animate-in" style={{ marginTop: '32px', border: '1px solid rgba(239, 68, 68, 0.3)', animationDelay: '0.2s' }}>
        <h2 className="heading-m" style={{ marginBottom: '16px', color: 'var(--accent-primary)', fontSize: '1rem' }}>Danger Zone</h2>
        <p style={{ marginBottom: '24px', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5' }}>
          Resetting will permanently delete all your training history. You can also restore demo data to see how the app looks with active history.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {import.meta.env.DEV && (
          <button 
            className="btn-primary spring-press" 
            style={{ 
              background: 'rgba(57, 255, 20, 0.1)', 
              color: 'var(--accent-secondary)', 
              border: '1px solid var(--accent-secondary)',
              boxShadow: 'none'
            }}
            onClick={() => {
              useAppStore.getState().seedDummyData();
              alert("Demo data restored!");
            }}
          >
            <Wand2 size={18} /> Restore Demo Data
          </button>
          )}
          
          <button 
            className="btn-primary spring-press" 
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--accent-primary)', 
              border: '1px solid var(--accent-primary)',
              boxShadow: 'none'
            }}
            onClick={handleReset}
          >
            <Trash2 size={18} /> Reset All History
          </button>
        </div>
      </div>

      {import.meta.env.DEV && (
      <div className="card animate-in" style={{ marginTop: '32px', border: '1px solid rgba(255, 255, 255, 0.1)', animationDelay: '0.25s', marginBottom: '40px' }}>
        <h2 className="heading-m" style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Developer Options</h2>
        <div className="flex-between spring-press" style={{ cursor: 'pointer' }} onClick={() => setProModalOpen(true)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: isPro ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 255, 255, 0.05)' }}>
              <Shield size={22} color={isPro ? "var(--accent-secondary)" : "var(--text-muted)"} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: '700' }}>Pro Status</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isPro ? 'Premium Active' : 'Free Tier'}</span>
            </div>
          </div>
          <div 
            style={{ 
              width: '50px', 
              height: '26px', 
              borderRadius: '16px', 
              background: isPro ? 'var(--accent-secondary)' : 'var(--bg-card-hover)',
              position: 'relative',
              transition: 'all 0.3s ease',
              pointerEvents: 'none'
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: '3px', 
              left: isPro ? '27px' : '3px', 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              background: '#fff',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }} />
          </div>
        </div>
        <p style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '24px' }}>
          This toggle is for testing the Freemium flow locally.
        </p>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '24px', marginTop: '24px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={18} color="var(--accent-primary)" />
            Log Manual Punches
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Testing utility to simulate workout volume.
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
                padding: '10px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
              onInvalid={(e: any) => e.target.setCustomValidity('Please enter a number of punches')}
              onInput={(e: any) => e.target.setCustomValidity('')}
            />
            <button 
              className="btn-primary" 
              style={{ width: 'auto', padding: '10px 20px', fontSize: '0.9rem' }}
              onClick={handleManualAdd}
            >
              Add
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

