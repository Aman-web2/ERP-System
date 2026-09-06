import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const toneClasses = {
  primary: 'bg-blue-50 text-blue-600 border-blue-100',
  success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  warning: 'bg-amber-50 text-amber-600 border-amber-100',
  danger: 'bg-rose-50 text-rose-600 border-rose-100',
};

const MetricCard = ({ label, value, helper, icon, tone = 'primary' }) => {
  const shineRef = useRef(null);

  useEffect(() => {
    if (shineRef.current) {
      gsap.to(shineRef.current, {
        x: '200%',
        duration: 1.5,
        repeat: -1,
        repeatDelay: 3,
        ease: 'power2.inOut',
      });
    }
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative metric-card bg-surface/80 group overflow-hidden border border-border rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/30"
    >
      {/* Premium GSAP Shine Effect */}
      <div 
        ref={shineRef}
        className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 z-20 pointer-events-none"
      />

      <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-extrabold text-muted uppercase tracking-widest mb-1 opacity-70">{label}</p>
          <h3 className="text-3xl font-black text-text tracking-tighter tabular-nums">{value}</h3>
          {helper && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className="h-1 w-1 rounded-full bg-primary/40" />
              <p className="text-[11px] font-bold text-muted uppercase tracking-wide">{helper}</p>
            </div>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 ${toneClasses[tone]} shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;

