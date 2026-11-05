declare module "*.css";

export {};

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}