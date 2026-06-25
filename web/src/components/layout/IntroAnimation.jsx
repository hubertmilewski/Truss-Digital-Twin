import { useState, useEffect } from "react";
import logo from "../../assets/images/pb-logo.png";

function IntroAnimation() {
  const [isVisible, setIsVisible] = useState(true);
  const [logoVisible, setLogoVisible] = useState(false);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {

    const logoTimer = setTimeout(() => {
      setLogoVisible(true);
    }, 300);

    const slideTimer = setTimeout(() => {
      setIsSliding(true);
    }, 1800);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2800);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(slideTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-300 bg-white flex items-center justify-center transition-transform duration-1000 ease-in-out border-b border-surface-border shadow-sm ${
        isSliding ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <img 
        src={logo} 
        alt="Politechnika Białostocka" 
        className={`h-32 sm:h-48 transition-opacity duration-1000 ease-in-out ${
          logoVisible ? "opacity-100" : "opacity-0"
        }`} 
      />
    </div>
  );
}

export default IntroAnimation;
