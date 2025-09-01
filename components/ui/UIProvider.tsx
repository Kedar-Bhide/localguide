import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Types for overlay system
type ToastType = 'success' | 'warning' | 'error';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface Modal {
  id: string;
  title: string;
  content: ReactNode;
  onClose?: () => void;
}

interface UIContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showModal: (modal: Omit<Modal, 'id'>) => void;
  hideModal: (id?: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

// Toast component
const ToastComponent: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ 
  toast, 
  onRemove 
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const bgColor = {
    success: 'bg-[color:var(--success)]',
    warning: 'bg-[color:var(--warning)]',
    error: 'bg-[color:var(--error)]',
  }[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`${bgColor} text-white px-4 py-3 rounded-xl shadow-lg flex items-start gap-3 max-w-sm`}
    >
      <div className="flex-1">
        <div className="font-medium text-sm">{toast.title}</div>
        {toast.message && (
          <div className="text-xs opacity-90 mt-1">{toast.message}</div>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/70 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// Modal component
const ModalComponent: React.FC<{ modal: Modal; onRemove: (id: string) => void }> = ({ 
  modal, 
  onRemove 
}) => {
  return (
    <Dialog.Root open={true} onOpenChange={() => onRemove(modal.id)}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title className="text-lg font-semibold text-[color:var(--ink)]">
                  {modal.title}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="text-[color:var(--muted-ink)] hover:text-[color:var(--ink)] transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>
              <div>{modal.content}</div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// UIProvider component
export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modals, setModals] = useState<Modal[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showModal = (modal: Omit<Modal, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setModals(prev => [...prev, { ...modal, id }]);
  };

  const hideModal = (id?: string) => {
    if (id) {
      setModals(prev => prev.filter(modal => modal.id !== id));
    } else {
      setModals(prev => prev.slice(0, -1)); // Remove last modal
    }
  };

  const contextValue: UIContextType = {
    showToast,
    showModal,
    hideModal,
  };

  return (
    <UIContext.Provider value={contextValue}>
      {children}
      
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastComponent
              key={toast.id}
              toast={toast}
              onRemove={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Modal container */}
      <AnimatePresence>
        {modals.map((modal) => (
          <ModalComponent
            key={modal.id}
            modal={modal}
            onRemove={hideModal}
          />
        ))}
      </AnimatePresence>
    </UIContext.Provider>
  );
};

// Hook to use overlay functionality
export const useOverlay = (): UIContextType => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useOverlay must be used within a UIProvider');
  }
  return context;
};