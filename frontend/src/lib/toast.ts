import { toast as sonnerToast } from 'sonner';

/**
 * Standardized Toast System
 * Ensures consistent severity, styling, and copy across the application.
 */
export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { description });
  },
  error: (message: string, description?: string) => {
    sonnerToast.error(message, { description });
  },
  info: (message: string, description?: string) => {
    sonnerToast.info(message, { description });
  },
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, { description });
  },

  // Pre-configured standard messages
  analysisCompleted: () => sonnerToast.success('Analysis completed', { description: 'The file has been successfully analyzed.' }),
  iocCopied: () => sonnerToast.success('IOC copied', { description: 'Indicator of compromise copied to clipboard.' }),
  reportGenerated: () => sonnerToast.success('Report generated', { description: 'Your intelligence report is ready to view.' }),
  investigationSaved: () => sonnerToast.success('Investigation saved', { description: 'All changes to the investigation have been saved.' }),
  paymentSuccessful: () => sonnerToast.success('Payment successful', { description: 'Your subscription has been updated.' }),
  settingsUpdated: () => sonnerToast.success('Settings updated', { description: 'Your workspace preferences have been saved.' }),
};
