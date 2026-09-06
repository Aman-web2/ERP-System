import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Panel = ({ title, subtitle, actions, children, className = '' }) => {
  const panelShineRef = useRef(null);

  useEffect(() => {
    if (panelShineRef.current) {
      gsap.to(panelShineRef.current, {
        x: '300%',
        duration: 2,
        repeat: -1,
        repeatDelay: 5,
        ease: 'power2.inOut',
      });
    }
  }, []);

  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`panel relative bg-surface border border-border rounded-3xl p-8 shadow-sm overflow-hidden ${className}`}
    >
      {/* Premium GSAP Shine */}
      <div 
        ref={panelShineRef}
        className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 z-20 pointer-events-none"
      />

      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary/5 to-transparent opacity-30" />
      
      {(title || actions) && (
        <div className="mb-8 flex flex-col gap-5 border-b border-border/50 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            {title && <h3 className="text-lg font-black text-text tracking-tighter uppercase">{title}</h3>}
            {subtitle && <p className="mt-1 text-xs text-muted font-bold opacity-60 uppercase tracking-widest">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
      )}
      <div className="relative">
        {children}
      </div>
    </motion.section>
  );
};

export default Panel;

