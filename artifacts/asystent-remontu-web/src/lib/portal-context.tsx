import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import type {
  ContractorPortalProfile,
  ContractorAccessState,
  ContractorPlanDefinition,
  ContractorPlanAssignment,
  BillingEvent,
  PromotionSlot,
  UsageVsLimit,
  BillingHistoryItem,
  InvoiceHistoryItem,
  ContractorBillingContact,
  WebBillingSession,
  PortalAuthState,
  PortalNotificationPrefs,
  ContractorPlanId,
} from './portal-types';
import {
  MOCK_PROFILE, MOCK_ACCESS, MOCK_ASSIGNMENT, MOCK_PLANS, MOCK_USAGE,
  MOCK_PROMOTIONS, MOCK_BILLING_EVENTS, MOCK_BILLING_HISTORY,
  MOCK_INVOICES, MOCK_BILLING_CONTACT, MOCK_NOTIFICATION_PREFS,
} from './portal-mock-data';

interface PortalContextValue {
  authState: PortalAuthState;
  isAdmin: boolean;
  profile: ContractorPortalProfile;
  access: ContractorAccessState;
  assignment: ContractorPlanAssignment;
  plans: ContractorPlanDefinition[];
  usage: UsageVsLimit[];
  promotions: PromotionSlot[];
  billingEvents: BillingEvent[];
  billingHistory: BillingHistoryItem[];
  invoices: InvoiceHistoryItem[];
  billingContact: ContractorBillingContact;
  notificationPrefs: PortalNotificationPrefs;
  isTestMode: boolean;
  currentSession: WebBillingSession | null;

  signIn: () => void;
  signOut: () => void;
  updateProfile: (updates: Partial<ContractorPortalProfile>) => void;
  updateBillingContact: (contact: ContractorBillingContact) => void;
  updateNotificationPrefs: (prefs: PortalNotificationPrefs) => void;
  startCheckout: (planId: ContractorPlanId, period: 'monthly' | 'yearly') => WebBillingSession;
  simulateCheckoutSuccess: (sessionId: string) => void;
  simulateCheckoutFailure: (sessionId: string) => void;
  simulateCheckoutCancel: (sessionId: string) => void;
  changePlan: (planId: ContractorPlanId) => void;
  cancelPlan: () => void;
}

const PortalContext = createContext<PortalContextValue | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<PortalAuthState>('authenticated');
  const [profile, setProfile] = useState<ContractorPortalProfile>(MOCK_PROFILE);
  const [access, setAccess] = useState<ContractorAccessState>(MOCK_ACCESS);
  const [assignment, setAssignment] = useState<ContractorPlanAssignment>(MOCK_ASSIGNMENT);
  const [usage] = useState<UsageVsLimit[]>(MOCK_USAGE);
  const [promotions] = useState<PromotionSlot[]>(MOCK_PROMOTIONS);
  const [billingEvents, setBillingEvents] = useState<BillingEvent[]>(MOCK_BILLING_EVENTS);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>(MOCK_BILLING_HISTORY);
  const [invoices] = useState<InvoiceHistoryItem[]>(MOCK_INVOICES);
  const [billingContact, setBillingContact] = useState<ContractorBillingContact>(MOCK_BILLING_CONTACT);
  const [notificationPrefs, setNotificationPrefs] = useState<PortalNotificationPrefs>(MOCK_NOTIFICATION_PREFS);
  const [currentSession, setCurrentSession] = useState<WebBillingSession | null>(null);
  const sessionRef = useRef<WebBillingSession | null>(null);

  const signIn = useCallback(() => setAuthState('authenticated'), []);
  const signOut = useCallback(() => setAuthState('unauthenticated'), []);

  const updateProfile = useCallback((updates: Partial<ContractorPortalProfile>) => {
    setProfile((p) => ({ ...p, ...updates }));
  }, []);

  const updateBillingContact = useCallback((contact: ContractorBillingContact) => {
    setBillingContact(contact);
  }, []);

  const updateNotificationPrefs = useCallback((prefs: PortalNotificationPrefs) => {
    setNotificationPrefs(prefs);
  }, []);

  const startCheckout = useCallback((planId: ContractorPlanId, period: 'monthly' | 'yearly') => {
    const plan = MOCK_PLANS.find((p) => p.id === planId);
    const amount = period === 'monthly' ? (plan?.monthlyPricePlaceholder ?? 0) : (plan?.yearlyPricePlaceholder ?? 0);
    const session: WebBillingSession = {
      id: 'ws-' + Date.now(),
      contractorId: profile.id,
      planId,
      billingPeriod: period,
      amount,
      currency: 'PLN',
      status: 'pending',
      createdAt: new Date().toISOString(),
      isTestMode: true,
    };
    sessionRef.current = session;
    setCurrentSession(session);
    return session;
  }, [profile.id]);

  const simulateCheckoutSuccess = useCallback((sessionId: string) => {
    const sess = sessionRef.current;
    if (!sess || sess.id !== sessionId) return;
    setCurrentSession({ ...sess, status: 'success', completedAt: new Date().toISOString() });
    const plan = MOCK_PLANS.find((p) => p.id === sess.planId);
    if (plan) {
      setAccess((a) => ({
        ...a,
        currentPlanId: plan.id,
        entitlements: plan.entitlements,
        isFullyActive: true,
        canUsePaidFeatures: plan.id !== 'free',
        canUseVisibilityFeatures: true,
      }));
      setAssignment((a) => ({ ...a, planId: plan.id, state: 'active', updatedAt: new Date().toISOString() }));
      setBillingEvents((evts) => [{
        id: 'be-' + Date.now(), contractorId: sess.contractorId, eventType: 'plan_upgraded',
        planId: plan.id, providerType: 'web_billing_placeholder',
        amount: sess.amount, currency: 'PLN', createdAt: new Date().toISOString(),
      }, ...evts]);
      setBillingHistory((h) => [{
        id: 'bh-' + Date.now(), date: new Date().toISOString().split('T')[0],
        description: `Plan ${plan.name} - ${sess.billingPeriod === 'monthly' ? 'miesieczny' : 'roczny'}`,
        amount: sess.amount, currency: 'PLN', status: 'paid', planId: plan.id,
      }, ...h]);
    }
  }, []);

  const simulateCheckoutFailure = useCallback((sessionId: string) => {
    const sess = sessionRef.current;
    if (!sess || sess.id !== sessionId) return;
    setCurrentSession({ ...sess, status: 'failed', completedAt: new Date().toISOString() });
    setBillingEvents((evts) => [{
      id: 'be-' + Date.now(), contractorId: sess.contractorId, eventType: 'payment_failed_placeholder',
      planId: sess.planId, providerType: 'web_billing_placeholder',
      notes: 'Platnosc nie powiodla sie (tryb testowy)', createdAt: new Date().toISOString(),
    }, ...evts]);
  }, []);

  const simulateCheckoutCancel = useCallback((sessionId: string) => {
    const sess = sessionRef.current;
    if (!sess || sess.id !== sessionId) return;
    setCurrentSession({ ...sess, status: 'cancelled', completedAt: new Date().toISOString() });
  }, []);

  const changePlan = useCallback((planId: ContractorPlanId) => {
    const plan = MOCK_PLANS.find((p) => p.id === planId);
    if (plan) {
      setAccess((a) => ({
        ...a, currentPlanId: plan.id, entitlements: plan.entitlements,
        canUsePaidFeatures: plan.id !== 'free',
      }));
      setAssignment((a) => ({ ...a, planId: plan.id, updatedAt: new Date().toISOString() }));
    }
  }, []);

  const cancelPlan = useCallback(() => {
    setAccess((a) => ({ ...a, assignmentState: 'inactive', canUsePaidFeatures: false }));
    setAssignment((a) => ({ ...a, state: 'inactive', updatedAt: new Date().toISOString() }));
  }, []);

  return (
    <PortalContext.Provider value={{
      authState, isAdmin: true, profile, access, assignment, plans: MOCK_PLANS, usage,
      promotions, billingEvents, billingHistory, invoices, billingContact,
      notificationPrefs, isTestMode: true, currentSession,
      signIn, signOut, updateProfile, updateBillingContact, updateNotificationPrefs,
      startCheckout, simulateCheckoutSuccess, simulateCheckoutFailure,
      simulateCheckoutCancel, changePlan, cancelPlan,
    }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal(): PortalContextValue {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be used within PortalProvider');
  return ctx;
}
