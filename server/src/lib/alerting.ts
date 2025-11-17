import axios from 'axios';

export async function sendPerformanceAlert(current: number, baseline: number) {
  const regression = ((current - baseline) / baseline * 100).toFixed(1);
  
  const message = {
    text: `⚠️ Performance Regression Detected`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Performance Regression Alert*\n\nCurrent p95: ${current}ms\nBaseline p95: ${baseline}ms\nRegression: +${regression}%`
        }
      }
    ]
  };
  
  // Отправить в Slack webhook
  if (process.env.SLACK_WEBHOOK_URL) {
    await axios.post(process.env.SLACK_WEBHOOK_URL, message);
  }
}

