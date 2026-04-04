const SUPPORT_NUMBER = '01286500085';
const WHATSAPP_URL = 'https://wa.me/201286500085';

export function SupportChatButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open support chat with ${SUPPORT_NUMBER}`}
      title={`Chat support: ${SUPPORT_NUMBER}`}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-3 py-2 text-white shadow-lg transition-opacity hover:opacity-90"
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current" aria-hidden="true">
        <path d="M19.11 17.03c-.29-.15-1.7-.84-1.96-.93-.26-.1-.45-.15-.64.15-.19.29-.74.93-.91 1.12-.16.19-.33.22-.62.08-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.45-1.7-1.62-1.99-.17-.29-.02-.45.13-.59.13-.13.29-.33.43-.5.15-.17.19-.29.29-.49.1-.19.05-.36-.02-.5-.07-.15-.64-1.54-.88-2.1-.23-.56-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.36-.26.29-.99.97-.99 2.36 0 1.39 1.01 2.73 1.15 2.92.15.19 1.97 3.01 4.78 4.22.67.29 1.2.46 1.61.59.68.22 1.3.19 1.79.12.55-.08 1.7-.69 1.94-1.35.24-.66.24-1.22.17-1.35-.07-.12-.26-.19-.55-.33z" />
        <path d="M16.02 3.2c-6.97 0-12.62 5.65-12.62 12.61 0 2.21.57 4.36 1.66 6.25L3.2 28.8l6.9-1.81a12.58 12.58 0 0 0 5.92 1.5h.01c6.96 0 12.61-5.65 12.61-12.61 0-3.37-1.31-6.54-3.7-8.92a12.54 12.54 0 0 0-8.92-3.76zm0 22.98h-.01a10.4 10.4 0 0 1-5.3-1.46l-.38-.22-4.1 1.08 1.1-4-.25-.41a10.3 10.3 0 0 1-1.58-5.48c0-5.71 4.65-10.35 10.37-10.35 2.77 0 5.37 1.08 7.32 3.03a10.3 10.3 0 0 1 3.03 7.32c0 5.72-4.65 10.36-10.35 10.36z" />
      </svg>
      <span className="text-xs font-sans font-medium whitespace-nowrap">For support send to 01286500085</span>
    </a>
  );
}

