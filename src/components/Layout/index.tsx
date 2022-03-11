import { ReactNode } from 'react';

import Header from '../Header';

import styles from './styles.module.scss';

interface LayoutProps {
  children: ReactNode | ReactNode[];
}

export const Layout = ({ children }: LayoutProps): JSX.Element => {
  return (
    <div className={styles.container}>
      <Header />
      <main>{children}</main>
    </div>
  );
};
