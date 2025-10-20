import * as React from 'react';

export function IndiaGate(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 21h10" />
      <path d="M8 21V15c0-1.66 1.34-3 3-3h2c1.66 0 3 1.34 3 3v6" />
      <path d="M7 12V9c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v3" />
      <path d="M5 7h14" />
      <path d="M6 7v-2a1 1 0 011-1h10a1 1 0 011 1v2" />
    </svg>
  );
}

export function GripVertical(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="19" r="1" />
        </svg>
    )
}
