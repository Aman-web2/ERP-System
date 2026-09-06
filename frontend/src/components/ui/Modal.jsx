import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ open, title, children, onClose, width = 'max-w-2xl' }) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`relative bg-surface w-full ${width} max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl border border-border flex flex-col`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
              <h3 className="text-lg font-bold text-text tracking-tight">{title}</h3>
              <button 
                type="button" 
                className="h-8 w-8 flex items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-text transition-colors"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

