import 'react';

declare module 'react' {
  interface ButtonHTMLAttributes {
    command?: 'show-modal' | 'close' | 'request-close' | `--${string}`;
    commandfor?: string;
  }
}
