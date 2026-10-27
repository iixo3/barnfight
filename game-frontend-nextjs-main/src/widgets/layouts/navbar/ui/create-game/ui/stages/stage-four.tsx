import React from "react";
import { motion } from "framer-motion";

type StageFourProps = {
  delta: number;
};

const StageFour: React.FC<StageFourProps> = ({ delta }) => {
  return (
    <motion.div
      initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col gap-y-8"
    >
      <div className="flex flex-col gap-y-3">
        <span className="text-white handjet-bold-20">Game format</span>
        <span className="text-text-secondary aeonik-light-13">
          Teams will be ranked by the number of tickets pledged. On the next
          slide, select which ranks will hold the winning tickets.
        </span>
      </div>

      <div className="flex flex-col gap-y-3">
        <span className="text-white handjet-bold-20">Additional tips</span>
        <span className="text-text-secondary aeonik-light-13">
          Design a simple lottery by choosing one project, or create a complex
          game where multiple positions (e.g., 3rd and 5th) hold winning
          tickets.
        </span>
      </div>

      <div className="flex flex-col gap-y-3">
        <span className="text-white handjet-bold-20">Multiple winners</span>
        <span className="text-text-secondary aeonik-light-13">
          If you select multiple winning ranks, funds will be divided based on
          Raydium's traded volume, with the lowest volume project receiving the
          largest share.
        </span>
      </div>
    </motion.div>
  );
};
export default StageFour;
