import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Plus, Trash2, CheckSquare } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Paywall } from '../components/Paywall';
import type { Workout } from '../data/workouts';
import { calculateDynamicPunches } from '../utils/workoutUtils';

const ROUND_BREAK_MARKER = ':::ROUND_BREAK:::';

export default function CustomBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawEditId = searchParams.get('edit');
  // Only accept IDs matching the pattern we generate: "custom-<digits>"
  const editId = rawEditId && /^custom-\d+$/.test(rawEditId) ? rawEditId : null;

  const isPro = useAppStore(state => state.isPro);
  const { addCustomWorkout, updateCustomWorkout, customWorkouts } = useAppStore();

  const [title, setTitle] = useState('My Custom Workout');
  const [rounds, setRounds] = useState(3);
  const [roundLength, setRoundLength] = useState(180); // seconds
  const [restBetweenRounds, setRestBetweenRounds] = useState(60); // seconds
  const [combinations, setCombinations] = useState<string[]>(['1 - 2', '1 - 2 - 3', '2 - 3 - 2']);
  const [newCombo, setNewCombo] = useState('');

  useEffect(() => {
    if (editId) {
      const workoutToEdit = customWorkouts.find((w) => w.id === editId);
      if (workoutToEdit) {
        setTitle(workoutToEdit.title);
        setRounds(workoutToEdit.rounds);
        setRoundLength(workoutToEdit.roundLength);
        setRestBetweenRounds(workoutToEdit.restBetweenRounds);
        
        // Load round combinations into the flat list with markers
        const roundCombos = workoutToEdit.roundCombinations;
        if (roundCombos && roundCombos.length > 0) {
          const flatList: string[] = [];
          roundCombos.forEach((set: string[], idx: number) => {
            flatList.push(...set);
            if (idx < roundCombos.length - 1) {
              flatList.push(ROUND_BREAK_MARKER);
            }
          });
          setCombinations(flatList);
        } else {
          setCombinations(workoutToEdit.combinations);
        }
      }
    }
  }, [editId, customWorkouts]);

  const handleAddCombo = () => {
    if (newCombo.trim() !== '') {
      setCombinations([...combinations, newCombo.trim()]);
      setNewCombo('');
    }
  };

  const handleAddRoundBreak = () => {
    // Prevent multiple consecutive round breaks or one at the end/start if already present
    if (combinations.length > 0 && combinations[combinations.length - 1] !== ROUND_BREAK_MARKER) {
      setCombinations([...combinations, ROUND_BREAK_MARKER]);
    }
  };

  const handleRemoveCombo = (index: number) => {
    const nextCombos = [...combinations];
    nextCombos.splice(index, 1);
    setCombinations(nextCombos);
  };

  const handleSave = () => {
    if (combinations.length === 0 || combinations.every(c => c === ROUND_BREAK_MARKER)) {
      alert('Please add at least one combination.');
      return;
    }

    // Sanitize title: strip HTML-injectable chars, enforce length limit (CWE-79)
    const safeTitle = title.replace(/[<>"'`]/g, '').trim().slice(0, 100) || 'My Custom Workout';

    // Process combinations into round-specific sets
    const roundCombos: string[][] = [];
    let currentSet: string[] = [];
    
    combinations.forEach(item => {
      if (item === ROUND_BREAK_MARKER) {
        if (currentSet.length > 0) {
          roundCombos.push(currentSet);
          currentSet = [];
        }
      } else {
        // Sanitize each combination string as well
        const safeCombo = item.replace(/[<>"'`]/g, '').trim().slice(0, 200);
        if (safeCombo) currentSet.push(safeCombo);
      }
    });
    if (currentSet.length > 0) roundCombos.push(currentSet);

    const newWorkout: Workout = {
      id: editId || 'custom-' + Date.now().toString(),
      type: 'Solo Bag',
      title: safeTitle,
      duration: Math.ceil((rounds * roundLength + (rounds - 1) * restBetweenRounds) / 60),
      rounds: rounds,
      roundLength: roundLength,
      restBetweenRounds: restBetweenRounds,
      combinations: roundCombos.length > 0 ? roundCombos[0] : combinations,
      roundCombinations: roundCombos.length > 1 ? roundCombos : undefined,
      difficulty: 'Intermediate',
      focus: 'Conditioning',
      punchesEst: 0, // Will be calculated dynamically in ActiveWorkout
      isCustom: true
    };

    // Calculate initial punchesEst for display in cards
    newWorkout.punchesEst = calculateDynamicPunches(newWorkout, useAppStore.getState().workoutPace);

    if (editId) {
      updateCustomWorkout(editId, newWorkout);
    } else {
      addCustomWorkout(newWorkout);
    }
    navigate('/workouts');
  };


  if (!isPro) {
    return (
      <div className="animate-in content-wrapper" style={{ padding: '24px' }}>
        <div className="page-header" style={{ marginBottom: '24px' }}>
          <div>
            <h1 className="heading-xl">Custom Combos</h1>
            <p>Build your own workout.</p>
          </div>
          <button onClick={() => navigate(-1)} className="header-action"><X size={22} /></button>
        </div>
        <Paywall 
          title="Custom Combo Builder" 
          description="Unlock the ability to create entirely custom workout rounds, tailored specifically to your needs."
          feature="Pro Feature: Custom Workouts"
        />
      </div>
    );
  }

  return (
    <div className="animate-in content-wrapper" style={{ paddingBottom: '100px' }}>
      <div className="page-header">
        <div>
          <h1 className="heading-xl">{editId ? 'Edit Workout' : 'Combo Builder'}</h1>
          <p>{editId ? 'Modify your routine.' : 'Design your own drills.'}</p>
        </div>
        <button onClick={() => navigate(-1)} className="header-action"><X size={22} /></button>
      </div>

      <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Workout Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff' }}
            required
            onInvalid={(e: any) => e.target.setCustomValidity('Please enter a workout title')}
            onInput={(e: any) => e.target.setCustomValidity('')}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rounds</label>
              <span style={{ fontWeight: 800 }}>{rounds}</span>
            </div>
            <input 
              type="range" min="1" max="15" 
              value={rounds} onChange={e => setRounds(Number(e.target.value))} 
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Round Length</label>
            <select value={roundLength} onChange={e => setRoundLength(Number(e.target.value))} className="ai-select">
              <option value="60">1 Min</option>
              <option value="120">2 Min</option>
              <option value="180">3 Min</option>
              <option value="300">5 Min</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Rest Period</label>
            <select value={restBetweenRounds} onChange={e => setRestBetweenRounds(Number(e.target.value))} className="ai-select">
              <option value="15">15 Sec</option>
              <option value="30">30 Sec</option>
              <option value="45">45 Sec</option>
              <option value="60">1 Min</option>
              <option value="90">1.5 Min</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        <h2 className="heading-m" style={{ marginBottom: '16px' }}>Combinations</h2>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input 
            type="text"
            placeholder="e.g. 1 - 2 - 3b"
            value={newCombo}
            onChange={(e) => setNewCombo(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff' }}
            onInvalid={(e: any) => e.target.setCustomValidity('Please enter a combination')}
            onInput={(e: any) => e.target.setCustomValidity('')}
          />
          <button 
            className="btn-primary spring-press"
            onClick={handleAddCombo}
            style={{ padding: '12px 16px', width: 'auto' }}
          >
            <Plus size={20} />
          </button>
        </div>

        <button 
          className="spring-press"
          onClick={handleAddRoundBreak}
          style={{ 
            width: '100%', 
            padding: '12px', 
            borderRadius: '12px', 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px dashed var(--border)', 
            color: 'var(--accent-primary)',
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '1px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Plus size={16} /> NEW ROUND START
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(() => {
            let roundCounter = 1;
            return (
              <>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Round {roundCounter} Start</div>
                {combinations.map((c, i) => {
                  if (c === ROUND_BREAK_MARKER) {
                    roundCounter++;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0 8px 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-primary)', whiteSpace: 'nowrap' }}>ROUND {roundCounter} START</div>
                        <button onClick={() => handleRemoveCombo(i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '4px' }}>
                          <X size={14} />
                        </button>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                      </div>
                    );
                  }
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{c}</span>
                      <button onClick={() => handleRemoveCombo(i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </>
            );
          })()}
          {combinations.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No combos added.</div>
          )}
        </div>
      </div>

      <button className="btn-primary spring-press" onClick={handleSave} style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1.1rem' }}>
        <CheckSquare size={20} fill="currentColor" /> {editId ? 'UPDATE WORKOUT' : 'SAVE WORKOUT'}
      </button>

    </div>
  );
}
