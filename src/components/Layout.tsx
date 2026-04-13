import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { Home, Timer, History, ChevronLeft, ChevronRight, Crown, User, Settings } from 'lucide-react';
import { BoxingGlove } from './Icons';
import { useTimerStore } from '../store/useTimerStore';
import { useAppStore } from '../store/useAppStore';
import { useEffect, useRef, useState } from 'react';
import { playBell, playTenSecWarning, playRoundEndBell } from '../utils/audio';
import { hapticHeavy } from '../utils/haptics';

export default function Layout() {
  const { isRunning, timeLeft, phase, tick, currentRound, rounds, roundTime, restTime } = useTimerStore();
  const { isPro } = useAppStore();
  const location = useLocation();
  const isTimerPage = location.pathname === '/timer';
  const wakeLockRef = useRef<any>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        // Round end warning at 10 seconds
        if (timeLeft === 10 && phase === 'Work') {
          playTenSecWarning();
        }
        
        // Bell at end of phase
        if (timeLeft === 0) {
          hapticHeavy();
          if (phase === 'Work') {
            playRoundEndBell();
          } else {
            playBell();
          }
        }
        
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, phase, tick]);

  useEffect(() => {
    const handleWakeLock = async () => {
      if (isRunning && !wakeLockRef.current) {
        try {
          if ('wakeLock' in navigator) {
            wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          }
        } catch {}
      } else if (!isRunning && wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
    handleWakeLock();
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const totalTime = phase === 'Work' ? roundTime : phase === 'Rest' ? restTime : 10;
  const progressPct = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className={`app-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} ${['Prepare', 'Work', 'Rest'].includes(phase) ? 'hide-sidebar-active' : ''}`}>
      {isRunning && !isTimerPage && (
        <NavLink to="/timer" className="active-timer-banner" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="banner-content">
            <span className={`pulse-dot ${phase === 'Work' ? 'work' : 'rest'}`} />
            <span className="banner-text">
              {phase === 'Work' ? 'WORK' : phase === 'Rest' ? 'REST' : 'PREPARE'} - {formatTime(timeLeft)} (Round {currentRound}/{rounds})
            </span>
          </div>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, height: '3px', 
            background: phase === 'Rest' ? 'var(--accent-secondary)' : 'var(--accent-primary)', 
            width: `${progressPct}%`, transition: 'width 1s linear'
          }} />
        </NavLink>
      )}
      
      <nav className="bottom-nav">
        <button 
          className="sidebar-toggle" 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          aria-label="Toggle Sidebar"
        >
          {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <img 
              src="/assets/logo.png" 
              alt="ComboCoach" 
              className="logo-img"
            />
          </Link>
        </div>

        <div className="nav-items-group">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ flex: 1 }}>
            <Home size={24} />
            <span className="nav-label">Home</span>
          </NavLink>
          <NavLink 
            to="/workouts" 
            className={({ isActive }) => `nav-item ${isActive || location.pathname.startsWith('/workout/') || location.pathname === '/ai-workout' ? 'active' : ''}`} 
            style={{ flex: 1 }}
          >
            <BoxingGlove size={24} />
            <span className="nav-label">Workouts</span>
          </NavLink>
          <NavLink to="/timer" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ flex: 1 }}>
            <Timer size={24} />
            <span className="nav-label">Timer</span>
          </NavLink>
          <NavLink to="/activity" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ flex: 1 }}>
            <History size={24} />
            <span className="nav-label">Activity</span>
          </NavLink>
        </div>

        <div className="sidebar-footer">
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} footer-nav-item`} style={{ flex: 1, marginBottom: '12px' }}>
            <Settings size={22} />
            <span className="nav-label">Settings</span>
          </NavLink>
          <Link to="/settings" className="user-tier-info">
            <div className={`tier-badge ${isPro ? 'pro' : 'free'}`}>
              {isPro ? <Crown size={18} /> : <User size={18} />}
            </div>
            {!isSidebarCollapsed && (
              <div className="tier-details">
                <span className="tier-status">{isPro ? 'Pro Member' : 'Free Tier'}</span>
                <span className="tier-action">{isPro ? 'Manage Account' : 'Upgrade Now'}</span>
              </div>
            )}
          </Link>
        </div>
      </nav>

      <div className="page-container">
        <Outlet />
      </div>
    </div>
  );
}
