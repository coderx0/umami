import styles from './Badge.module.css';

export interface BadgeProps {
  variant: 'good' | 'warning' | 'danger' | 'gray';
  children: React.ReactNode;
  dot?: boolean;
  id?: string;
}

export function Badge({ variant, children, dot = true, id }: BadgeProps) {
  return (
    <span id={id} className={`${styles.badge} ${styles[variant]}`}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}
