export const timeToMilliseconds = (timeString: string): number => {
    // Словарь для множителей
    const timeUnits: { [key: string]: number } = {
        m: 60 * 1000, // минута в миллисекундах
        h: 60 * 60 * 1000, // час в миллисекундах
        d: 24 * 60 * 60 * 1000, // день в миллисекундах
    };

    // Извлекаем числовую часть и единицу измерения
    const match = timeString.match(/^(\d+)(min|h|d|m|y)$/);

    if (!match) {
        console.log('timeToMilliseconds: неверный шаблон: ', timeString);
        return 0;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multiplier = timeUnits[unit];

    if (!multiplier) {
        console.log('timeToMilliseconds: неверный шаблон: ', timeString);
        return 0;
    }

    return value * multiplier;
};
