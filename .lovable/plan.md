

## Fix Assignment Volume Chart - Data Integrity and Year Navigation

### Problem
1. The "Year" tab only shows the current year (2026), but assignment data starts from 2025
2. The Supabase query has a default 1000-row limit, but 2025 alone has 3,330 assignments -- meaning monthly/yearly counts are inaccurate
3. No way to navigate between years to compare historical data

### Solution

#### 1. Create a database function for server-side aggregation
Instead of fetching all individual assignment dates (which hits the 1000-row limit), create an RPC function that returns pre-aggregated counts grouped by date. This is more efficient and avoids the row limit issue entirely.

```sql
CREATE OR REPLACE FUNCTION get_assignments_volume(
  start_date date,
  end_date date,
  group_by text DEFAULT 'daily'
)
RETURNS TABLE(period_date date, assignment_count bigint)
```

The function will group by day (for weekly/monthly views) or by month (for yearly view), returning only the aggregated counts.

#### 2. Update DashboardVolumeChart component
- Add a year selector (left/right arrows) that appears for all tabs, showing "This Week", "Feb 2026", or "2025"/"2026" etc.
- Replace the client-side date fetching with the new RPC call
- For the yearly tab, allow navigating back to 2025 and forward to 2026
- For monthly tab, allow navigating to previous months
- Show a total count in the header for quick reference

#### 3. UI Changes
- Add navigation arrows (chevron left/right) next to the period label
- Display the period label dynamically (e.g., "January 2026", "Week of Feb 24", "2025")
- Keep the existing toggle group for Week/Month/Year
- Add a small total assignments badge for quick preview

### Files to modify
- **New migration**: Create `get_assignments_volume` RPC function
- **`src/components/DashboardVolumeChart.tsx`**: Add year/period navigation, use RPC for data, show totals

