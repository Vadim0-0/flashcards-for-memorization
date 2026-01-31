import type { WordCard } from '@/shared/types/card'

const splitEnglish = (value: string): string[] => {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

const buildCard = (id: number, russian: unknown, english: unknown): WordCard | null => {
  if (typeof russian !== 'string' || !russian.trim()) return null

  let englishList: string[] = []

  if (Array.isArray(english)) {
    englishList = english.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
  } else if (typeof english === 'string') {
    englishList = splitEnglish(english)
  }

  if (englishList.length === 0) return null

  return {
    id,
    russian: russian.trim(),
    english: englishList
  }
}

const parseStringItem = (id: number, item: string): WordCard | null => {
  const pipeIndex = item.indexOf('|')
  if (pipeIndex !== -1) {
    const russian = item.slice(0, pipeIndex).trim()
    const english = item.slice(pipeIndex + 1).trim()
    return buildCard(id, russian, english)
  }

  const dashSplit = item.split(' - ')
  if (dashSplit.length >= 2) {
    const russian = dashSplit[0].trim()
    const english = dashSplit.slice(1).join(' - ').trim()
    return buildCard(id, russian, english)
  }

  return null
}

export const normalizeWordCards = (data: unknown): WordCard[] => {
  if (!data) return []

  // Format: { "russian": ["english1", "english2"] }
  if (typeof data === 'object' && !Array.isArray(data)) {
    const entries = Object.entries(data as Record<string, unknown>)
    return entries
      .map(([russian, english], index) => buildCard(index + 1, russian, english))
      .filter((card): card is WordCard => Boolean(card))
  }

  if (!Array.isArray(data)) return []

  const cards: WordCard[] = []

  data.forEach((item, index) => {
    if (!item) return

    if (typeof item === 'string') {
      const card = parseStringItem(index + 1, item)
      if (card) cards.push(card)
      return
    }

    if (Array.isArray(item)) {
      const [russian, ...english] = item
      const card = buildCard(index + 1, russian, english)
      if (card) cards.push(card)
      return
    }

    if (typeof item === 'object') {
      const maybeCard = item as Partial<WordCard>
      if (typeof maybeCard.russian === 'string') {
        const card = buildCard(
          typeof maybeCard.id === 'number' ? maybeCard.id : index + 1,
          maybeCard.russian,
          Array.isArray(maybeCard.english) ? maybeCard.english : (maybeCard as { english?: string }).english
        )
        if (card) cards.push(card)
      }
    }
  })

  return cards
}
