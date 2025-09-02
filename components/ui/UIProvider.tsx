import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { ToastProvider, ToastContainer, useToast } from './toast';
import { Dialog as CustomDialog, ConfirmDialog } from './dialog';

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
  showModal: (modal: Omit<Modal, 'id'>) => void;
  hideModal: (id?: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);


// Modal component
const ModalComponent: React.FC<{ modal: Modal; onRemove: (id: string) => void }> = ({ 
  modal, 
  onRemove 
}) => {
  return (
    <RadixDialog.Root open={true} onOpenChange={() => onRemove(modal.id)}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
        </RadixDialog.Overlay>
        <RadixDialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <RadixDialog.Title className="text-lg font-semibold text-[color:var(--ink)]">
                  {modal.title}
                </RadixDialog.Title>
                <RadixDialog.Close asChild>
                  <button className="text-[color:var(--muted-ink)] hover:text-[color:var(--ink)] transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </RadixDialog.Close>
              </div>
              <div>{modal.content}</div>
            </div>
          </motion.div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

// UIProvider component
export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<Modal[]>([]);

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
    showModal,
    hideModal,
  };

  return (
    <ToastProvider>
      <UIContext.Provider value={contextValue}>
        {children}
        
        {/* Toast container - using new toast system */}
        <ToastContainer />

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
    </ToastProvider>
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

// Re-export toast hook for convenience
export { useToast };