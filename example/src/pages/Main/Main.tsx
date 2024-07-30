import React, { useCallback, useEffect } from 'react';
import { useToast, useLoader, useTimer } from 'library-react-hooks';
import styles from '../../assests/styles/page.module.scss';
import classNames from 'classnames';
import { ReactComponent as ArrowRightIcon } from '../../assests/icons/arrowRight.svg';
import { useNavigate } from 'react-router-dom';
import { ROUTE_FULL_HTTP, ROUTE_FULL_LOADER, ROUTE_FULL_TIMER, ROUTE_FULL_TOAST } from '../../constants/routes';
import { openLink } from '../../utils/url';

const ToastDemo: React.VFC = () => {
  const { alert } = useToast();
  const navigate = useNavigate();

  return (
    <div className={classNames(styles.common_margin__xxl, styles.common_column)}>
      <h5>Toast Hook</h5>
      <div className={styles.common_buttons}>
        <button
          className={classNames(styles.common_buttonPrimary, styles.common_buttonPrimary__outlined)}
          onClick={() => alert({ text: 'Some error message.', type: 'error', tag: 'error1' })}
        >
          Show
        </button>
        <button className={styles.common_buttonPrimary} onClick={() => navigate(ROUTE_FULL_TOAST)}>
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
};

const LoaderDemo: React.VFC = () => {
  const { loaderOn, loaderStop } = useLoader();
  const navigate = useNavigate();

  const clickHandle = useCallback(() => {
    loaderOn();
    setTimeout(() => loaderStop(), 3000);
  }, [loaderOn, loaderStop]);

  return (
    <div className={classNames(styles.common_margin__xxl, styles.common_column)}>
      <h5>Loader Hook</h5>
      <div className={styles.common_buttons}>
        <button
          className={classNames(styles.common_buttonPrimary, styles.common_buttonPrimary__outlined)}
          onClick={clickHandle}
        >
          Show
        </button>
        <button className={styles.common_buttonPrimary} onClick={() => navigate(ROUTE_FULL_LOADER)}>
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
};

const TimerDemo: React.VFC = () => {
  const { setTimer, time, on } = useTimer();
  const navigate = useNavigate();
  const timerName = 'myTimer';

  useEffect(() => {
    const clear = on((e) => {
      console.log('e', e);
    });
    return () => clear();
  }, [on]);

  const clickHandle = useCallback(() => {
    setTimer(10, { name: timerName, observe: true, listen: true });
  }, [setTimer]);

  return (
    <div className={classNames(styles.common_margin__xxl, styles.common_column)}>
      <h5>Timer Hook</h5>
      <p className={classNames(styles.common_margin__m, styles.common_secondaryText)}>time: {time[timerName]}</p>
      <div className={styles.common_buttons}>
        <button
          className={classNames(styles.common_buttonPrimary, styles.common_buttonPrimary__outlined)}
          onClick={clickHandle}
        >
          Start
        </button>
        <button className={styles.common_buttonPrimary} onClick={() => navigate(ROUTE_FULL_TIMER)}>
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
};

const HttpDemo: React.VFC = () => {
  const navigate = useNavigate();

  return (
    <div className={classNames(styles.common_margin__xxl, styles.common_column)}>
      <h5>Http Hook</h5>
      <div className={styles.common_buttons}>
        <button
          className={classNames(styles.common_buttonPrimary, styles.common_buttonPrimary__outlined)}
          onClick={() => {}}
        >
          Show
        </button>
        <button className={styles.common_buttonPrimary} onClick={() => navigate(ROUTE_FULL_HTTP)}>
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
};

const HelperDemo: React.VFC = () => {
  return (
    <div className={classNames(styles.common_margin__xxl, styles.common_column)}>
      <h5>Helper Hooks</h5>
      <div className={classNames(styles.common_column, styles.common_margin__l)}>
        <div className={classNames(styles.page_row)}>
          <h6>Update State Hook</h6>
          <button
            className={classNames(
              styles.common_buttonSecondary,
              styles.common_buttonSecondary__outlined,
              styles.common_buttonSecondary__xs,
            )}
            onClick={() =>
              openLink(
                `https://github.com/Ann2827/library-react-hooks/blob/main/src/hooks/helper/README.md#update_state_hook`,
              )
            }
          >
            Docs
          </button>
        </div>
      </div>
    </div>
  );
};

const Main: React.VFC = () => {
  return (
    <div className={styles.page_wrapper}>
      <div className={styles.page_header}>
        <h2>Hooks Demo</h2>
      </div>
      <div className={styles.page_content}>
        <button
          className={classNames(styles.common_buttonSecondary, styles.common_buttonSecondary__outlined)}
          onClick={() => openLink(`https://github.com/Ann2827/library-react-hooks/blob/main/README.md`)}
        >
          Docs
        </button>
        <ToastDemo />
        <LoaderDemo />
        <TimerDemo />
        <HttpDemo />
        <HelperDemo />
      </div>
    </div>
  );
};

export default Main;
