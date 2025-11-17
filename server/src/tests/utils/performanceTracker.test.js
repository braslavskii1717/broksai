const { PerformanceTracker } = require('./performanceTracker');

// Пример: записываем пару результатов
PerformanceTracker.record(120);
PerformanceTracker.record(187);

PerformanceTracker.saveBaseline();
console.log('Baseline сохранён.');

// Проверить регрессию
const result = PerformanceTracker.checkRegression();
console.log('Регрессия:', result ? 'нет' : 'обнаружена');

