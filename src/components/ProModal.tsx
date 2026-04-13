import { useAppStore } from '../store/useAppStore';
import { X, Check, Crown, Sparkles, Brain, Mic, Zap, BarChart3, Lock } from 'lucide-react';

export default function ProModal() {
  const { isProModalOpen, setProModalOpen, isPro, togglePro } = useAppStore();

  if (!isProModalOpen) return null;

  const handleUpgrade = () => {
    togglePro(); // Simulate payment success
    setProModalOpen(false);
  };

  const benefits = [
    {
      icon: <Brain size={20} />,
      title: "AI Workout Generation",
      description: "Infinite unique workouts tailored to your goals using Gemini AI."
    },
    {
      icon: <Crown size={20} />,
      title: "Exclusive Content",
      description: "Access our full library of professional 'Workout of the Day' routines."
    },
    {
      icon: <Mic size={20} />,
      title: "Advanced Voice Control",
      description: "Control your pace hands-free with 'Faster' and 'Slower' commands."
    },
    {
      icon: <Zap size={20} />,
      title: "Randomized Combos",
      description: "Keep your mind sharp with unpredictable, randomized combination flows."
    },
    {
      icon: <BarChart3 size={20} />,
      title: "Deep Analytics",
      description: "Track your punch volume and training frequency with historical charts."
    },
    {
      icon: <Sparkles size={20} />,
      title: "Lifetime Access",
      description: "No subscriptions. Pay once, own your training journey forever."
    }
  ];

  return (
    <div className="modal-overlay pro-modal-overlay" onClick={() => setProModalOpen(false)}>
      <div 
        className="modal-content pro-modal-content animate-pop" 
        onClick={e => e.stopPropagation()}
        style={{ width: '90%', maxWidth: '440px', padding: 0, overflow: 'hidden', borderRadius: '16px' }}
      >
        <button 
          className="modal-close" 
          onClick={() => setProModalOpen(false)}
        >
          <X size={20} />
        </button>

        {/* Header Section */}
        <div className="pro-modal-header">
          <div className="pro-glow-effect" />
          <div className="coin-container">
            <Crown size={40} color="#FFD700" fill="#FFD700" className="floating-icon" />
          </div>
          <h2 className="pro-title">Upgrade to Pro</h2>
          <p className="pro-subtitle">Become a master of the ring with ultimate tools</p>
        </div>

        {/* Benefits List */}
        <div className="pro-benefits-container">
          <div className="benefits-grid">
            {benefits.map((benefit, i) => (
              <div key={i} className="pro-benefit-item" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="benefit-icon-wrapper">
                  {benefit.icon}
                </div>
                <div className="benefit-text">
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
                <Check size={16} className="check-icon" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer / CTA */}
        <div className="pro-modal-footer">
          <button className="btn-primary pro-upgrade-btn spring-press" onClick={handleUpgrade}>
            <Sparkles size={18} />
            {isPro ? "ALREADY PRO (MANAGE)" : "UNLOCK LIFETIME ACCESS - €2,99"}
          </button>
          <p className="secure-payment-text">
            <Lock size={10} /> Secure one-time payment. No hidden fees.
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .pro-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          background: rgba(0, 0, 0, 0.7);
        }

        .pro-modal-content {
          position: relative;
          background: #0f0f0f;
          border: 1px solid rgba(255, 215, 0, 0.2);
          box-shadow: 0 0 50px rgba(0,0,0,0.5), 0 0 20px rgba(255, 215, 0, 0.05);
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 50;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.1);
        }

        .animate-pop {
          animation: popUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes popUp {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .pro-modal-header {
          position: relative;
          padding: 40px 24px 24px;
          text-align: center;
          background: linear-gradient(180deg, rgba(255, 215, 0, 0.1) 0%, rgba(15, 15, 15, 1) 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          overflow: hidden;
        }

        .pro-glow-effect {
          position: absolute;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
          filter: blur(40px);
          pointer-events: none;
        }

        .coin-container {
          width: 80px;
          height: 80px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 215, 0, 0.1);
          border-radius: 50%;
          border: 1px solid rgba(255, 215, 0, 0.3);
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.2);
        }

        .pro-title {
          font-weight: 900;
          font-size: 1.8rem;
          color: white;
          text-transform: uppercase;
          letter-spacing: -0.5px;
          margin: 0;
          line-height: 1;
        }

        .pro-subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-top: 8px;
        }

        .pro-benefits-container {
          padding: 24px;
          max-height: 50vh;
          overflow-y: auto;
        }

        @media (min-height: 700px) {
          .pro-benefits-container {
            max-height: 380px;
          }
        }

        .benefits-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pro-benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 4px;
          animation: slideInRight 0.4s ease-out both;
        }

        .benefit-icon-wrapper {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFD700;
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .benefit-text {
          flex: 1;
        }

        .benefit-text h3 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .benefit-text p {
          margin: 4px 0 0;
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .check-icon {
          color: #FFD700;
          margin-top: 2px;
          opacity: 0.8;
          flex-shrink: 0;
        }

        .pro-modal-footer {
          padding: 24px;
          background: rgba(0, 0, 0, 0.3);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          text-align: center;
        }

        .pro-upgrade-btn {
          width: 100%;
          padding: 16px;
          font-size: 1rem;
          font-weight: 900;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: black;
          border-radius: 12px;
          border: none;
          box-shadow: 0 8px 30px rgba(255, 165, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .secure-payment-text {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        @keyframes floatingIcon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .floating-icon {
          animation: floatingIcon 3s ease-in-out infinite;
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}} />
    </div>
  );
}
