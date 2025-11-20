import * as fs from 'fs';
import * as path from 'path';

interface RankingItem {
  id: string;
  name: string;
  position: number;
}

interface RankingSnapshot {
  query: string;
  results: RankingItem[];
  timestamp: string;
}

const SNAPSHOT_PATH = path.join(__dirname, '__snapshots__/search-rankings.json');

describe('Search Rankings Snapshot Test', () => {
  let snapshot: RankingSnapshot[];
  let hasFailure = false;

  beforeAll(() => {
    // Load snapshot if exists
    if (fs.existsSync(SNAPSHOT_PATH)) {
      snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf-8'));
    } else {
      snapshot = [];
    }
  });

  afterAll(() => {
    // Fail if ranking changes detected
    if (hasFailure) {
      throw new Error('Search ranking changes detected (position shift >1)');
    }
  });

  const getCurrentRankings = (query: string): RankingItem[] => {
    // Mock function - replace with actual search implementation
    // This should call your real search/ranking logic
    return [
      { id: '1', name: 'Property A', position: 1 },
      { id: '2', name: 'Property B', position: 2 },
      { id: '3', name: 'Property C', position: 3 },
      { id: '4', name: 'Property D', position: 4 },
      { id: '5', name: 'Property E', position: 5 },
    ];
  };

  const compareRankings = (
    query: string,
    current: RankingItem[],
    baseline: RankingItem[] | undefined
  ): void => {
    if (!baseline || baseline.length === 0) {
      console.log(`📊 NEW: First snapshot for query "${query}"`);
      return;
    }

    let maxShift = 0;
    const changes: string[] = [];

    current.forEach((currentItem) => {
      const baselineItem = baseline.find((b) => b.id === currentItem.id);
      if (baselineItem) {
        const shift = Math.abs(currentItem.position - baselineItem.position);
        if (shift > maxShift) {
          maxShift = shift;
        }
        if (shift > 1) {
          changes.push(
            `  ${currentItem.name}: position ${baselineItem.position} → ${currentItem.position} (shift: ${shift})`
          );
        }
      }
    });

    if (maxShift > 1) {
      hasFailure = true;
      console.error(`❌ FAIL: Ranking changes detected for query "${query}"`);
      console.error(`  Max position shift: ${maxShift}`);
      changes.forEach((change) => console.error(change));
    } else if (maxShift > 0) {
      console.log(
        `⚠️  MINOR: Query "${query}" has minor changes (shift ≤1), still passing`
      );
    } else {
      console.log(`✅ OK: Query "${query}" rankings unchanged`);
    }
  };

  test('Check search rankings for query: "luxury apartments"', () => {
    const query = 'luxury apartments';
    const currentRankings = getCurrentRankings(query);
    const baselineEntry = snapshot.find((s) => s.query === query);

    compareRankings(query, currentRankings, baselineEntry?.results);

    // Update snapshot
    const updatedEntry: RankingSnapshot = {
      query,
      results: currentRankings,
      timestamp: new Date().toISOString(),
    };

    if (baselineEntry) {
      const index = snapshot.findIndex((s) => s.query === query);
      snapshot[index] = updatedEntry;
    } else {
      snapshot.push(updatedEntry);
    }

    // Write snapshot
    const snapshotDir = path.dirname(SNAPSHOT_PATH);
    if (!fs.existsSync(snapshotDir)) {
      fs.mkdirSync(snapshotDir, { recursive: true });
    }
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2));
  });
});
