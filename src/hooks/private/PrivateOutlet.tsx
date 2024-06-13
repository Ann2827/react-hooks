import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import usePrivatePages from './privatePages.hook';

type TPrivateOutletProps = { path: string; direct?: React.ReactNode | null };

const PrivateOutlet: React.FC<TPrivateOutletProps> = ({ path, direct }) => {
  const { checkPage, on } = usePrivatePages();

  const { available, redirect } = useMemo(() => checkPage(path), [checkPage, path]);
  const [show, setShow] = useState(available);

  useEffect(() => {
    setShow(checkPage(path).available);
    const clear = on((event) => {
      if (event.path === path) {
        setShow(event.available);
      }
    });
    return () => clear();
  }, [checkPage, on, path]);

  if (show) return <Outlet />;
  return direct ? <>{direct}</> : <Navigate to={redirect} />;
};

export default PrivateOutlet;
