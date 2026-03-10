import { motion } from "framer-motion";

const StatCard = ({ label, value, delta, icon: Icon, color = "electric" }) => (
  <motion.article whileHover={{ y: -3 }} className="glass neon-border rounded-2xl p-4">
    <div className="mb-3 flex items-center justify-between">
      <p className="text-sm text-blue-100/70">{label}</p>
      {Icon ? <Icon size={16} className={color === "violet" ? "text-violet" : "text-electric"} /> : null}
    </div>
    <p className="font-display text-2xl font-semibold text-white">{value}</p>
    {delta ? <p className="mt-2 text-xs text-emerald-300">{delta}</p> : null}
  </motion.article>
);

export default StatCard;
