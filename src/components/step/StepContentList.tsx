"use client";

import { motion } from "framer-motion";
import type { ContentBlock } from "@/features/curriculum/types";
import { ContentBlockRenderer } from "@/components/step/blocks/ContentBlockRenderer";
import { fadeUp, staggerContainer } from "@/lib/animations";

const listVariants = staggerContainer(0.1);

export function StepContentList({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <motion.div initial="hidden" animate="show" variants={listVariants} className="space-y-5">
      {blocks.map((block, i) => (
        <motion.div key={i} variants={fadeUp}>
          <ContentBlockRenderer block={block} />
        </motion.div>
      ))}
    </motion.div>
  );
}
