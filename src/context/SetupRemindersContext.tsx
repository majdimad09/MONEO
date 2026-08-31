import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  SetupItem, SetupItemKey, SETUP_ITEMS,
  SetupData, computeMissingKeys,
  loadReminderState, saveReminderState, SNOOZE_MS,
  ReminderPersistedState,
} from '../utils/setupReminders';
import { AppView } from '../types/finance';

interface SetupRemindersContextValue {
  activeItems: SetupItem[];
  missingKeys: SetupItemKey[];
  hasAnyActive: boolean;
  isMissing: (key: SetupItemKey) => boolean;
  dismiss: (key: SetupItemKey) => void;
  snooze: (key: SetupItemKey) => void;
  navigateToItem: (item: SetupItem) => void;
}

const SetupRemindersContext = createContext<SetupRemindersContextValue>({
  activeItems: [],
  missingKeys: [],
  hasAnyActive: false,
  isMissing: () => false,
  dismiss: () => {},
  snooze: () => {},
  navigateToItem: () => {},
});

interface Props {
  children: React.ReactNode;
  data: SetupData;
  onNavigate: (view: AppView) => void;
  onTriggerCheckIn: () => void;
}

export const SetupRemindersProvider: React.FC<Props> = ({
  children, data, onNavigate, onTriggerCheckIn,
}) => {
  const [persisted, setPersisted] = useState<ReminderPersistedState>(loadReminderState);

  const missingKeys = useMemo(
    () => computeMissingKeys(data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.recurringIncome, data.subscriptions, data.monthlyBudget, data.savingGoals, data.checkIn],
  );

  const activeItems = useMemo(() => {
    const now = Date.now();
    return SETUP_ITEMS.filter(item => {
      if (!missingKeys.includes(item.key)) return false;
      if (persisted.dismissed.includes(item.key)) return false;
      const snoozedUntil = persisted.snoozed[item.key];
      if (snoozedUntil && snoozedUntil > now) return false;
      return true;
    });
  }, [missingKeys, persisted]);

  const dismiss = useCallback((key: SetupItemKey) => {
    setPersisted(prev => {
      const next: ReminderPersistedState = {
        ...prev,
        dismissed: prev.dismissed.includes(key) ? prev.dismissed : [...prev.dismissed, key],
      };
      saveReminderState(next);
      return next;
    });
  }, []);

  const snooze = useCallback((key: SetupItemKey) => {
    setPersisted(prev => {
      const next: ReminderPersistedState = {
        ...prev,
        snoozed: { ...prev.snoozed, [key]: Date.now() + SNOOZE_MS },
      };
      saveReminderState(next);
      return next;
    });
  }, []);

  const navigateToItem = useCallback((item: SetupItem) => {
    if (item.targetView === 'check-in') {
      onTriggerCheckIn();
    } else {
      onNavigate(item.targetView as AppView);
    }
  }, [onNavigate, onTriggerCheckIn]);

  const isMissing = useCallback(
    (key: SetupItemKey) => missingKeys.includes(key),
    [missingKeys],
  );

  return (
    <SetupRemindersContext.Provider value={{
      activeItems,
      missingKeys,
      hasAnyActive: activeItems.length > 0,
      isMissing,
      dismiss,
      snooze,
      navigateToItem,
    }}>
      {children}
    </SetupRemindersContext.Provider>
  );
};

export function useSetupReminders() {
  return useContext(SetupRemindersContext);
}
