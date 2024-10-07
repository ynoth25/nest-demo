'use client';

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useEffect, useRef } from 'react';

export function AnimatedNumber({
     start,
     end,
     decimals = 0,
   }: {
  start: number;
  end: number;
  decimals?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const value = useMotionValue(start); // Initialize with `start`
  const spring = useSpring(value, { damping: 30, stiffness: 100 });
  const display = useTransform(spring, (num) => num.toFixed(decimals));

  useEffect(() => {
    if (isInView) {
      value.set(end); // Only set to `end` when in view
    }
  }, [isInView, end, value]);

  // Initial value to ensure consistent rendering
  useEffect(() => {
    if (!isInView) {
      value.set(start);
    }
  }, [isInView, start, value]);

  return <motion.span ref={ref}>{display}</motion.span>;
}