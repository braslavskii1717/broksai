import { PerformanceTracker } from './performanceTracker';

(async () => {
  PerformanceTracker.record(120);
  PerformanceTracker.record(187);

  PerformanceTracker.saveBaseline();
  console.log('Baseline сохранён.');

  const result = await PerformanceTracker.checkRegression();
  console.log('Регрессия:', result ? 'нет' : 'обнаружена');
})();

