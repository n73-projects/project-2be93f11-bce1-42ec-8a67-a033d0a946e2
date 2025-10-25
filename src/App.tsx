import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { ChartContainer, ChartTooltip } from "./components/ui/chart";
import type { ChartConfig } from "./components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

// Trading pairs data
const tradingPairs = ["BTC-USDT", "ETH-USDT", "XMR-USDT"];

// Trading data interfaces
interface TradeBarData {
  id: string;
  type: 'LONG' | 'SHORT';
  startTime: string;
  endTime: string;
  fundingTotal: number;
  periods: number;
  fee: number;
  startPrice: number;
  endPrice: number;
  duration: number; // Duration in days for bar height
  profitLoss: number; // For bar color
  dateLabel: string; // For X-axis display
  startDay: number; // Day number for positioning
}

// Generate mock trading data for each pair as bars
const generateTradingData = (pair: string) => {
  const basePrice = pair === "BTC-USDT" ? 43000 : pair === "ETH-USDT" ? 2500 : 180;
  const trades: TradeBarData[] = [];
  
  // Generate trades over the last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Generate 8-12 trades over the 30-day period
  const numTrades = Math.floor(Math.random() * 5) + 8;
  
  for (let t = 0; t < numTrades; t++) {
    // Random start day within the 30-day window
    const startDayOffset = Math.floor(Math.random() * 25); // Start within first 25 days
    const startDate = new Date(thirtyDaysAgo.getTime() + startDayOffset * 24 * 60 * 60 * 1000);
    
    // Random duration between 1-8 days
    const durationDays = Math.floor(Math.random() * 7) + 1;
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    const tradeType = Math.random() > 0.5 ? 'LONG' : 'SHORT';
    const fundingTotal = (Math.random() - 0.5) * 3; // -1.5% to +1.5%
    const fee = 1.20;
    
    // Calculate periods (assuming 8-hour periods per day)
    const periods = durationDays * 3;
    
    // Calculate profit/loss for bar height (0-100 scale)
    const profitLoss = Math.abs(fundingTotal) * 20 + 20; // Scale for visualization
    
    trades.push({
      id: `trade-${t}`,
      type: tradeType,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      fundingTotal,
      periods,
      fee,
      startPrice: basePrice + (Math.random() - 0.5) * basePrice * 0.1,
      endPrice: basePrice + (Math.random() - 0.5) * basePrice * 0.1,
      duration: durationDays,
      profitLoss,
      dateLabel: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      startDay: startDayOffset
    });
  }
  
  // Sort trades by start date
  trades.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  return trades;
};

const chartConfig = {
  profitLoss: {
    label: "Trade Performance",
    color: "hsl(var(--chart-1))",
  },
  long: {
    label: "LONG Trade",
    color: "hsl(var(--chart-2))",
  },
  short: {
    label: "SHORT Trade",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const TradingChart = ({ pair }: { pair: string }) => {
  const trades = generateTradingData(pair);
  
  const longTrades = trades.filter(t => t.type === 'LONG').length;
  const shortTrades = trades.filter(t => t.type === 'SHORT').length;
  const avgFunding = trades.reduce((sum, t) => sum + t.fundingTotal, 0) / trades.length;

  const formatTradeDate = (dateString: string) => {
    return new Date(dateString).toISOString().slice(0, 19).replace('T', ' ');
  };

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const trade = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm">
            <span className={trade.type === 'LONG' ? 'text-green-600' : 'text-red-600'}>
              {trade.type} Trade
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Duration: {trade.duration} day{trade.duration > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-muted-foreground">
            Funding: <span className={trade.fundingTotal >= 0 ? 'text-green-600' : 'text-red-600'}>
              {trade.fundingTotal >= 0 ? '+' : ''}{trade.fundingTotal.toFixed(2)}%
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            Periods: {trade.periods}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold">{pair}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Avg Funding: 
              <span className={`ml-2 ${avgFunding >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {avgFunding >= 0 ? '+' : ''}{avgFunding.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>Long: {longTrades}</div>
            <div>Short: {shortTrades}</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trades} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <XAxis 
                dataKey="dateLabel" 
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Duration (Days)', angle: -90, position: 'insideLeft' }}
              />
              <ChartTooltip content={<CustomTooltip />} />
              
              {/* Trade bars */}
              <Bar dataKey="duration" radius={[2, 2, 0, 0]}>
                {trades.map((trade, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={trade.type === 'LONG' ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-3))'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Trade History */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Recent Trades</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {trades.map((trade) => (
              <div key={trade.id} className="text-xs font-mono bg-muted/50 p-2 rounded">
                <span className={`font-semibold ${trade.type === 'LONG' ? 'text-green-600' : 'text-red-600'}`}>
                  TRADE {trade.type}
                </span>
                {' | '}
                <span>{formatTradeDate(trade.startTime)} → {formatTradeDate(trade.endTime)}</span>
                {' | '}
                <span className={trade.fundingTotal >= 0 ? 'text-green-600' : 'text-red-600'}>
                  Funding total (neto): {trade.fundingTotal >= 0 ? '+' : ''}{trade.fundingTotal.toFixed(2)}%
                </span>
                {' | '}
                <span>Periods: {trade.periods}</span>
                {' | '}
                <span>Fee: ${trade.fee.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Trading Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Bar chart visualization of trading pairs showing trade duration and performance
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tradingPairs.map((pair) => (
            <TradingChart key={pair} pair={pair} />
          ))}
        </div>
        
        <Card className="p-6">
          <h3 className="font-semibold mb-4 text-lg">Trading Bar Chart Legend & Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Chart Elements</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-6 bg-chart-2 rounded-sm"></div>
                  <span>LONG Trade Bar (Green)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-6 bg-chart-3 rounded-sm"></div>
                  <span>SHORT Trade Bar (Red)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border border-muted-foreground rounded-sm"></div>
                  <span>Bar Height = Trade Duration (Days)</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Trading Information</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Each bar represents one complete trade from open to close</p>
                <p>• Bar height shows trade duration in days</p>
                <p>• X-axis shows trade start dates over the last 30 days</p>
                <p>• LONG trades (green bars) vs SHORT trades (red bars)</p>
                <p>• Hover over bars for detailed trade information</p>
                <p>• Trade history below shows complete trade details</p>
                <p>• Funding totals show net profit/loss percentage per trade</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;
