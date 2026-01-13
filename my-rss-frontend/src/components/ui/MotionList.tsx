import { motion, type Variants, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface MotionListProps extends HTMLMotionProps<'div'> {
    children: ReactNode;
    className?: string;
}

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1,
            when: "beforeChildren"
        }
    }
};

const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 260, damping: 20 }
    }
};

export function MotionContainer({ children, className = "", ...props }: MotionListProps) {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function MotionItem({ children, className = "", ...props }: HTMLMotionProps<'div'>) {
    return (
        <motion.div
            variants={item}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}