// Утилиты и хелперы

// Базовый URL, откуда загружаем JSON‑данные.
// Берется из переменной окружения VITE_REMOTE_BASE (файл .env)
// Если не указана, используется локальный путь (для dev-режима)
const REMOTE_BASE = import.meta.env.VITE_REMOTE_BASE || ''

export const getDataUrl = (relativePath: string): string => {
  // Если путь уже абсолютный (http/https) — возвращаем как есть
  if (/^https?:\/\//i.test(relativePath)) {
    return relativePath
  }

  // Если указан REMOTE_BASE, используем его (для продакшена с GitHub)
  if (REMOTE_BASE) {
    // Убираем начальный слэш из relativePath, если он есть
    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath
    // Убираем конечный слэш из REMOTE_BASE, если он есть
    const cleanBase = REMOTE_BASE.endsWith('/') ? REMOTE_BASE.slice(0, -1) : REMOTE_BASE
    return `${cleanBase}/${cleanPath}`
  }

  // Если REMOTE_BASE не указан, используем локальный путь (для dev-режима)
  return relativePath.startsWith('/') ? relativePath : `/${relativePath}`
}

export { useLanguage } from './useLanguage'
export { useExerciseName } from './useExerciseName'
export { useThemeName } from './useThemeName'
export { useTranslations, usePageTranslations } from './useTranslations'
export type { AppLanguage } from './useLanguage'
export type { ExerciseName } from './useExerciseName'
export type { ThemeName } from './useThemeName'
export type { PageName, PageTranslations, Translations } from './useTranslations'
