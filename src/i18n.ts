import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { LocaleOptions, addLocale, locale } from 'primereact/api'
import ru from 'primelocale/ru.json'

addLocale('ru', ru.ru as LocaleOptions)

i18n.on('languageChanged', lng => {
    switch (lng) {
        case 'en':
        case 'ru':
            locale(lng)
            console.log(`locale ${lng}`)
            break
        default: throw `invalid locale: ${lng}`
    }
})

i18n.on('initialized', options => {
    const lng = i18n.resolvedLanguage ?? options.lng ?? 'en'
    console.log(`locale ${lng}`)
    locale(lng)
})

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        debug: true,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: {
                translation: {
                    search: 'Search',
                    settings: 'Settings',
                    clear: 'Clear',
                    menu: {
                        pilots: 'Pilots',
                        tracks: 'Tracks',
                        races: 'Races',
                    },
                    pilot: {
                        raceList: 'Pilot race list',
                        hideScatter: 'Hide scatter',
                        showScatter: 'Show scatter',
                        smoothing: 'Smoothing',
                        raceCount: 'Race count',
                        updateCount: 'Update count',
                        avgSeasonDelta: 'Average delta %',
                        longestStreak: 'Longest streak',
                    },
                    pilots: {
                        races: 'Races',
                        name: 'Name',
                        raceCount: 'Race count',
                        avgDelta: 'Avg. delta %',
                        totalUpdates: 'Total updates',
                        longestStreak: 'Longest streak',
                        seasonStart: 'Season start',
                        seasonEnd: 'Season end',
                    },
                    race: {
                        chartBarsSize: 'Chart bars size',
                        trackRaceList: '🗐 Track race list',
                        trackNameCopied: 'Track name copied to clipboard'
                    },
                    races: {
                        pilot: 'Pilot',
                        season: 'Season',
                        date: 'Date',
                        pilots: 'Pilots',
                        updates: 'Updates',
                        track: 'Track',
                    },
                    tracks: {
                        repeats: 'Repeats',
                        map: 'Map',
                        track: 'Track',
                        updates: 'Updates',
                    },
                }
            },
            ru: {
                translation: {
                    search: 'Поиск',
                    settings: 'Настройки',
                    clear: 'Сбросить',
                    menu: {
                        pilots: 'Пилоты',
                        tracks: 'Трассы',
                        races: 'Гонки',
                    },
                    pilot: {
                        raceList: 'Список гонок пилота',
                        daysDifference: 'Разница в днях',
                        hideScatter: 'Скрыть точки',
                        showScatter: 'Показать точки',
                        smoothing: 'Сглаживание',
                        raceCount: 'Количество гонок',
                        updateCount: 'Количество обновлений',
                        avgSeasonDelta: 'Средняя дельта % за сезон',
                        longestStreak: 'Макс. непрерывных дней гонок',
                    },
                    pilots: {
                        races: 'Гонки',
                        name: 'Имя',
                        raceCount: 'Количество гонок',
                        avgDelta: 'Сред дельта %',
                        totalUpdates: 'Всего загрузок',
                        longestStreak: 'Дней подряд',
                        seasonStart: 'Начало сезона',
                        seasonEnd: 'Конец сезона',
                    },
                    race: {
                        chartBarsSize: 'Масштаб графика',
                        trackRaceList: '🗐 Гонки на этой трассе',
                        trackNameCopied: 'Название трассы скопировано',
                    },
                    races: {
                        pilot: 'Пилот',
                        season: 'Сезон',
                        date: 'Дата',
                        pilots: 'Пилотов',
                        updates: 'Загрузок',
                        track: 'Трасса',
                    },
                    tracks: {
                        repeats: 'Повторов',
                        map: 'Карта',
                        track: 'Трасса',
                        updates: 'Загрузок',
                    },
                }
            }
        }
    });

export default i18n;