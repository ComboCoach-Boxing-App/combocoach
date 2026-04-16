import { useState, useEffect } from 'react';
import loadingBg from '../assets/loading_bg.jpg';
import appLogo from '../assets/app_logo.png';

const tips = [
  "Keep your hands up at all times.",
  "Breathe out with every punch.",
  "Snap your punches for maximum speed.",
  "Rotate your hips to generate power.",
  "Keep your chin tucked in.",
  "Move your head after every combination.",
  "Tighten your fist at the moment of impact.",
  "Step with your lead foot when you jab.",
  "Maintain a solid stance for better balance.",
  "Control the center of the ring."
];

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [tip, setTip] = useState("");

  useEffect(() => {
    // Select a random tip
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setTip(randomTip);

    // Fade out after 2.5 seconds (to finish at 3s)
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2500);

    // Remove from DOM after 3 seconds
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`loading-screen ${isFading ? 'fade-out' : ''}`}
      style={{ 
        backgroundImage: `url(${loadingBg})`,
        backgroundColor: '#000',
        backgroundSize: 'cover',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="loading-content">
        <div className="loading-logo-wrapper">
          <img src={appLogo} alt="ComboCoach" className="loading-logo-img" />
        </div>

        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <div className="loading-progress-bar">
            <div className="loading-progress-inner"></div>
          </div>
        </div>

        <div className="loading-tip-container">
          <span className="tip-label">Pro Tip</span>
          <p className="tip-text">{tip}</p>
        </div>
      </div>
    </div>
  );
}
