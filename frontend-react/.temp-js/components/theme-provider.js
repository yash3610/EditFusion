'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { ThemeProvider as NextThemesProvider, } from 'next-themes';
export function ThemeProvider({ children, ...props }) {
    return _jsx(NextThemesProvider, { ...props, children: children });
}
