"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const pathname = usePathname();

  const redirectedPathName = (locale: string) => {
    if (!pathname) return "/";
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  return (
    <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
      <Link href={redirectedPathName("en")} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: pathname.startsWith('/en') ? 'bold' : 'normal' }}>
        EN
      </Link>
      <span style={{color: '#E2E8F0'}}>|</span>
      <Link href={redirectedPathName("zh")} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: pathname.startsWith('/zh') ? 'bold' : 'normal' }}>
        中文
      </Link>
    </div>
  );
}
