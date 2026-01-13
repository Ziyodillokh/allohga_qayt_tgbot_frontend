'use client';

// Telegram Web App types
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
      photo_url?: string;
    };
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  close: () => void;
  expand: () => void;
  ready: () => void;
  sendData: (data: string) => void;
  switchInlineQuery: (query: string, chooseChatTypes?: string[]) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  showPopup: (params: { title?: string; message: string; buttons?: Array<{ id?: string; type?: string; text?: string }> }, callback?: (buttonId: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  requestWriteAccess: (callback?: (granted: boolean) => void) => void;
  requestContact: (callback?: (contact: any) => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Check if running in Telegram Mini App
export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;
  
  const webApp = window.Telegram?.WebApp;
  // initData must exist and not be empty
  if (!webApp?.initData || webApp.initData.length === 0) return false;
  
  // Also check if initDataUnsafe has user data
  if (!webApp.initDataUnsafe?.user?.id) return false;
  
  return true;
}

// Get Telegram WebApp instance
export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp || null;
}

// Get init data for authentication
export function getTelegramInitData(): string | null {
  const webApp = getTelegramWebApp();
  return webApp?.initData || null;
}

// Get user from init data
export function getTelegramUser() {
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe?.user || null;
}

// Get color scheme
export function getTelegramColorScheme(): 'light' | 'dark' {
  const webApp = getTelegramWebApp();
  return webApp?.colorScheme || 'light';
}

// Get theme params
export function getTelegramThemeParams() {
  const webApp = getTelegramWebApp();
  return webApp?.themeParams || {};
}

// Ready signal
export function telegramReady() {
  const webApp = getTelegramWebApp();
  webApp?.ready();
}

// Expand to full height
export function telegramExpand() {
  const webApp = getTelegramWebApp();
  webApp?.expand();
}

// Close Mini App
export function telegramClose() {
  const webApp = getTelegramWebApp();
  webApp?.close();
}

// Haptic feedback
export function telegramHaptic(type: 'success' | 'error' | 'warning' | 'impact') {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  
  if (type === 'impact') {
    webApp.HapticFeedback.impactOccurred('medium');
  } else {
    webApp.HapticFeedback.notificationOccurred(type);
  }
}

// Show alert
export function telegramAlert(message: string): Promise<void> {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      webApp.showAlert(message, resolve);
    } else {
      alert(message);
      resolve();
    }
  });
}

// Show confirm
export function telegramConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      webApp.showConfirm(message, resolve);
    } else {
      resolve(confirm(message));
    }
  });
}

// Request contact (phone number) from Telegram
export function requestTelegramContact(callback: (contact: any) => void) {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.requestContact((contact) => {
      callback(contact);
    });
  }
}

// Main button helpers
export const mainButton = {
  show: (text: string, onClick: () => void) => {
    const webApp = getTelegramWebApp();
    if (!webApp) return;
    
    webApp.MainButton.setText(text);
    webApp.MainButton.onClick(onClick);
    webApp.MainButton.show();
  },
  hide: () => {
    const webApp = getTelegramWebApp();
    webApp?.MainButton.hide();
  },
  showProgress: () => {
    const webApp = getTelegramWebApp();
    webApp?.MainButton.showProgress();
  },
  hideProgress: () => {
    const webApp = getTelegramWebApp();
    webApp?.MainButton.hideProgress();
  },
  enable: () => {
    const webApp = getTelegramWebApp();
    webApp?.MainButton.enable();
  },
  disable: () => {
    const webApp = getTelegramWebApp();
    webApp?.MainButton.disable();
  },
};

// Back button helpers
export const backButton = {
  show: (onClick: () => void) => {
    const webApp = getTelegramWebApp();
    if (!webApp) return;
    
    webApp.BackButton.onClick(onClick);
    webApp.BackButton.show();
  },
  hide: () => {
    const webApp = getTelegramWebApp();
    webApp?.BackButton.hide();
  },
};

// Open external link
export function openLink(url: string, inApp = false) {
  const webApp = getTelegramWebApp();
  if (webApp) {
    if (url.startsWith('https://t.me/')) {
      webApp.openTelegramLink(url);
    } else {
      webApp.openLink(url, { try_instant_view: inApp });
    }
  } else {
    window.open(url, '_blank');
  }
}
