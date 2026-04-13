import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, X, Settings2, Loader2, Info } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { generateComboCoachWorkout } from '../utils/comboCoachService';
import { Paywall } from '../components/Paywall';

export default function GenerateWorkout() {
  const navigate = useNavigate();
  const setAiWorkout = useAppStore(state => state.setAiWorkout);
  const workoutPace = useAppStore(state => state.workoutPace);
  
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [progressiveDifficulty, setProgressiveDifficulty] = useState(false);
  const [rounds, setRounds] = useState(6);
  const [roundLength, setRoundLength] = useState(180); // seconds
  const [restPeriod, setRestPeriod] = useState(60); // seconds
  const [focus, setFocus] = useState<'Speed' | 'Power' | 'Defense' | 'Conditioning' | 'Footwork' | 'Technique'>('Conditioning');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);
  const isPro = useAppStore(state => state.isPro);

  const handleGenerate = async () => {
    if (!isPro) return;
    setIsGenerating(true);
    setErrorMSG(null);
    try {
      // Small simulated delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const workout = await generateComboCoachWorkout({
        difficulty,
        progressiveDifficulty,
        rounds,
        roundLength,
        restPeriod,
        focus
      });
      
      setAiWorkout(workout);
      navigate('/workout/ai-generated/active');
    } catch (error: any) {
      setErrorMSG(error.message || 'Failed to generate workout. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getProgressiveText = () => {
    if (!progressiveDifficulty) return null;
    if (difficulty === 'Beginner') {
      return "All rounds will use Beginner combinations.";
    }
    if (difficulty === 'Intermediate') {
      return "Starts with Beginner rounds, progresses to Intermediate.";
    }
    if (difficulty === 'Advanced') {
      if (rounds < 3) return "Progression compressed — difficulty increases each round.";
      return "Starts Beginner → Intermediate → Advanced across your rounds.";
    }
    return null;
  };

  return (
    <div className="animate-in content-wrapper">
      <div className="page-header">
        <div>
          <h1 className="heading-xl" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wand2 size={32} color="var(--accent-primary)" /> AI ComboCoach
          </h1>
          <p>Create a custom workout on the fly.</p>
        </div>
        <button 
          onClick={() => navigate('/workouts')}
          className="header-action"
        >
          <X size={22} />
        </button>
      </div>

      <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '20px' }}>
        
        {/* Difficulty */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Difficulty</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Beginner', 'Intermediate', 'Advanced'].map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d as any)}
                className="spring-press"
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: '12px',
                  border: `1px solid ${difficulty === d ? 'var(--accent-primary)' : 'var(--border)'}`,
                  background: difficulty === d ? 'rgba(88, 204, 2, 0.1)' : 'transparent',
                  color: difficulty === d ? 'var(--accent-primary)' : 'var(--text-main)',
                  fontWeight: difficulty === d ? 700 : 500
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Progressive Difficulty Toggle */}
        <div style={{ marginBottom: '24px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
          <div className="flex-between spring-press" style={{ cursor: 'pointer', marginBottom: progressiveDifficulty ? '8px' : '0' }} onClick={() => setProgressiveDifficulty(!progressiveDifficulty)}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>Progressive Difficulty</span>
            </div>
            <div 
              style={{ 
                width: '42px', 
                height: '24px', 
                borderRadius: '12px', 
                background: progressiveDifficulty ? 'var(--accent-primary)' : 'var(--bg-card-hover)',
                position: 'relative',
                transition: 'all 0.3s ease',
                pointerEvents: 'none'
              }}
            >
              <div style={{ 
                position: 'absolute', 
                top: '3px', 
                left: progressiveDifficulty ? '21px' : '3px', 
                width: '18px', 
                height: '18px', 
                borderRadius: '50%', 
                background: '#fff',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }} />
            </div>
          </div>
          {progressiveDifficulty && (
             <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
               {getProgressiveText()}
             </div>
          )}
        </div>

        {/* Focus */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Main Focus</label>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
            {['Speed', 'Power', 'Defense', 'Conditioning', 'Footwork', 'Technique'].map(f => (
              <button
                key={f}
                onClick={() => setFocus(f as any)}
                className="spring-press"
                style={{
                  padding: '8px 16px',
                  borderRadius: '16px',
                  whiteSpace: 'nowrap',
                  border: `1px solid ${focus === f ? '#fff' : 'var(--border)'}`,
                  background: focus === f ? '#fff' : 'transparent',
                  color: focus === f ? '#000' : 'var(--text-main)',
                  fontWeight: 600
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Rounds */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <label style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Rounds</label>
            <span style={{ fontWeight: 800 }}>{rounds}</span>
          </div>
          <input 
            type="range" 
            min="1" max="20" 
            value={rounds} 
            onChange={(e) => setRounds(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
        </div>

        {/* Duration / Length */}
        <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Round Length</label>
            <select 
              value={roundLength}
              onChange={(e) => setRoundLength(Number(e.target.value))}
              className="ai-select"
            >
              <option value="60">1 Min</option>
              <option value="120">2 Min</option>
              <option value="180">3 Min</option>
              <option value="300">5 Min</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Rest Period</label>
            <select 
              value={restPeriod}
              onChange={(e) => setRestPeriod(Number(e.target.value))}
              className="ai-select"
            >
              <option value="15">15 Sec</option>
              <option value="30">30 Sec</option>
              <option value="45">45 Sec</option>
              <option value="60">1 Min</option>
              <option value="90">1.5 Min</option>
            </select>
          </div>
        </div>

        {/* Pace Options Info */}
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Combo Pace</label>
           <div 
             onClick={() => navigate('/settings')}
             className="spring-press"
             style={{ 
               cursor: 'pointer', 
               padding: '12px', 
               background: 'rgba(255,255,255,0.03)', 
               borderRadius: '12px', 
               fontSize: '0.85rem', 
               color: 'var(--text-muted)', 
               display: 'flex', 
               alignItems: 'center', 
               gap: '8px',
               border: '1px solid var(--border)'
             }}
           >
             <Info size={16} color="var(--accent-primary)"/> Uses your global setting of <strong>{workoutPace}s</strong> pacing <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.6 }}>CHANGE →</span>
           </div>
        </div>
      </div>

      {errorMSG && (
        <div style={{ padding: '16px', background: 'rgba(255, 50, 50, 0.1)', border: '1px solid rgba(255,50,50,0.3)', borderRadius: '12px', color: '#ff6b6b', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Info size={18} /> {errorMSG}
        </div>
      )}

      {!isPro ? (
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <Paywall 
            title="AI ComboCoach" 
            description="Unlock the ability to select from 500+ curated boxing combinations grouped by stance, focus, and difficulty."
            feature="Pro Feature: AI ComboCoach"
          />
        </div>
      ) : (
        <button 
          className={`btn-primary spring-press ${isGenerating ? 'animate-pulse' : ''}`}
          style={{ 
            width: '100%', 
            padding: '16px', 
            fontSize: '1.1rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            background: isGenerating ? 'var(--bg-card)' : 'var(--gradient-primary)',
            borderColor: isGenerating ? 'var(--accent-primary)' : 'transparent',
            borderWidth: isGenerating ? '1px' : '0',
            borderStyle: 'solid'
          }}
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <><Loader2 size={24} className="animate-spin" color="var(--accent-primary)" /> Retrieving Combos...</>
          ) : (
            <><Settings2 size={24} /> Generate & Start</>
          )}
        </button>
      )}

    </div>
  );
}
