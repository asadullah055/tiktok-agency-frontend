import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ModalForm = ({ open, onClose, title, children, panelClassName = "" }) => (
  <AnimatePresence>
    {open ? (
      <Dialog open={open} onClose={onClose} className="relative z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/65 backdrop-blur-sm"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel
            as={motion.div}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className={`glass neon-border w-full rounded-2xl p-5 ${panelClassName || "max-w-lg"}`}
          >
            <div className="mb-4 flex items-center justify-between">
              <DialogTitle className="font-display text-lg text-white">{title}</DialogTitle>
              <button type="button" onClick={onClose} className="rounded-lg p-2 text-blue-100/70 hover:bg-white/5">
                <X size={16} />
              </button>
            </div>
            {children}
          </DialogPanel>
        </div>
      </Dialog>
    ) : null}
  </AnimatePresence>
);

export default ModalForm;
