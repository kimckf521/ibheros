import 'server-only';

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  zh: () => import('./dictionaries/zh.json').then((module) => module.default),
};

export const getDictionary = async (locale: 'en' | 'zh') => {
  if (!dictionaries[locale]) {
    console.log(`Missing dictionary for locale: ${locale}, falling back to en`);
    return dictionaries['en']();
  }
  return dictionaries[locale]();
};
