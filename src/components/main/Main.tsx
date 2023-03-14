import React, {
  memo, useCallback, useEffect, useState,
} from '../../lib/teact/teact';
import { withGlobal, getActions } from '../../global';

import { selectCurrentAccountState } from '../../global/selectors';
import useFlag from '../../hooks/useFlag';

import TransferModal from '../transfer/TransferModal';
import Notifications from './Notifications';

import StakingInfoModal from '../staking/StakingInfoModal';
import StakeModal from '../staking/StakeModal';
import UnstakingModal from '../staking/UnstakeModal';

import BackupModal from './modals/BackupModal';
import SignatureModal from './modals/SignatureModal';
import TransactionModal from './modals/TransactionModal';
import DappConnectModal from '../dapps/DappConnectModal';
import DappTransactionModal from '../dapps/DappTransactionModal';

import Actions from './sections/Actions';
import Card from './sections/Card';
import Content from './sections/Content';
import Header from './sections/Header';
import Warnings from './sections/Warnings';

import styles from './Main.module.scss';

type StateProps = {
  currentTokenSlug?: string;
  currentAccountId?: string;
  isStakingActive: boolean;
  isUnstakeRequested?: boolean;
};

function Main({
  currentTokenSlug,
  currentAccountId,
  isStakingActive,
  isUnstakeRequested,
}: StateProps) {
  const { selectToken, startStaking, fetchBackendStakingState } = getActions();

  const [activeTabIndex, setActiveTabIndex] = useState<number>(currentTokenSlug ? 1 : 0);
  const [isStakingInfoOpened, openStakingInfo, closeStakingInfo] = useFlag(false);
  const [isBackupWalletOpened, openBackupWallet, closeBackupWallet] = useFlag(false);

  useEffect(() => {
    if (currentAccountId && (isStakingActive || isUnstakeRequested)) {
      fetchBackendStakingState();
    }
  }, [fetchBackendStakingState, currentAccountId, isStakingActive, isUnstakeRequested]);

  const handleTokenCardClose = useCallback(() => {
    selectToken({ slug: undefined });
    setActiveTabIndex(0);
  }, [selectToken]);

  const handleEarnClick = useCallback(() => {
    if (isStakingActive || isUnstakeRequested) {
      openStakingInfo();
    } else {
      startStaking();
    }
  }, [isStakingActive, isUnstakeRequested, openStakingInfo, startStaking]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.head}>
          <Warnings onOpenBackupWallet={openBackupWallet} />
          <Header onBackupWalletOpen={openBackupWallet} />
          <Card onTokenCardClose={handleTokenCardClose} onApyClick={handleEarnClick} />
          <Actions hasStaking={isStakingActive} isUnstakeRequested={isUnstakeRequested} onEarnClick={handleEarnClick} />
        </div>

        <Content
          activeTabIndex={activeTabIndex}
          setActiveTabIndex={setActiveTabIndex}
          onStakedTokenClick={handleEarnClick}
        />
      </div>

      <BackupModal isOpen={isBackupWalletOpened} onClose={closeBackupWallet} />
      <TransferModal />
      <SignatureModal />
      <TransactionModal />
      <Notifications />
      <StakeModal onViewStakingInfo={openStakingInfo} />
      <UnstakingModal />
      <StakingInfoModal isOpen={isStakingInfoOpened} onClose={closeStakingInfo} />
      <DappConnectModal />
      <DappTransactionModal />
    </>
  );
}

export default memo(withGlobal((global, ownProps, detachWhenChanged): StateProps => {
  detachWhenChanged(global.currentAccountId);
  const accountState = selectCurrentAccountState(global);

  return {
    isStakingActive: Boolean(accountState?.stakingBalance) && !accountState?.isUnstakeRequested,
    isUnstakeRequested: accountState?.isUnstakeRequested,
    currentTokenSlug: selectCurrentAccountState(global)?.currentTokenSlug,
    currentAccountId: global.currentAccountId,
  };
})(Main));
