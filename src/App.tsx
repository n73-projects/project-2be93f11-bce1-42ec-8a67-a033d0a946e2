import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./components/ui/chart";
import type { ChartConfig } from "./components/ui/chart";
import { ComposedChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

// Trading pairs data
const tradingPairs = ["BTC-USDT", "ETH-USDT", "XMR-USDT"];

// Trading data interfaces
interface TradeData {
  id: string;
  type: 'LONG' | 'SHORT';
  startTime: string;
  endTime: string;
  fundingTotal: number;
  periods: number;
  fee: number;
  startPrice: number;
  endPrice: number;
}

interface PricePoint {
  timestamp: string;
  time: string;
  price: number;
  openTrade: number | null;
  closeTrade: number | null;
  volume: number;
}

// Generate mock trading data for each pair
const generateTradingData = (pair: string) => {
  const basePrice = pair === "BTC-USDT" ? 43000 : pair === "ETH-USDT" ? 2500 : 180;
  const data: PricePoint[] = [];
  const trades: TradeData[] = [];
  
  // Generate more realistic price movements with trend
  let currentPrice = basePrice;
  const trend = (Math.random() - 0.5) * 0.02; // Small trend factor
  
  // Generate some realistic trades first
  for (let t = 0; t < 5; t++) {
    const startIndex = Math.floor(Math.random() * 70) + 10;
    const duration = Math.floor(Math.random() * 20) + 5; // 5-25 periods
    const endIndex = Math.min(startIndex + duration, 95);
    
    const tradeType = Math.random() > 0.5 ? 'LONG' : 'SHORT';
    const fundingTotal = (Math.random() - 0.5) * 2; // -1% to +1%
    const fee = 1.20;
    
    const startTime = new Date(Date.now() - (99 - startIndex) * 15 * 60 * 1000);
    const endTime = new Date(Date.now() - (99 - endIndex) * 15 * 60 * 1000);
    
    trades.push({
      id: `trade-${t}`,
      type: tradeType,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      fundingTotal,
      periods: duration,
      fee,
      startPrice: 0, // Will be set later
      endPrice: 0    // Will be set later
    });
  }
  
  for (let i = 0; i < 100; i++) {
    // Price moves with some volatility and trend
    const volatility = 0.02 + Math.random() * 0.03;
    const change = (Math.random() - 0.5) * volatility + trend;
    currentPrice = currentPrice * (1 + change);
    
    const timestamp = new Date(Date.now() - (99 - i) * 15 * 60 * 1000);
    
    // Check if this point is a trade start or end
    let openTrade = null;
    let closeTrade = null;
    
    for (const trade of trades) {
      const tradeStart = new Date(trade.startTime).getTime();
      const tradeEnd = new Date(trade.endTime).getTime();
      const currentTime = timestamp.getTime();
      
      if (Math.abs(currentTime - tradeStart) < 15 * 60 * 1000) { // Within 15 minutes
        openTrade = currentPrice;
        trade.startPrice = currentPrice;
      }
      if (Math.abs(currentTime - tradeEnd) < 15 * 60 * 1000) { // Within 15 minutes
        closeTrade = currentPrice;
        trade.endPrice = currentPrice;
      }
    }
    
    data.push({
      timestamp: timestamp.toISOString(),
      time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: Math.round(currentPrice * 100) / 100,
      openTrade,
      closeTrade,
      volume: Math.round((Math.random() * 1000 + 100) * 100) / 100,
    });
  }
  
  return { data, trades };
};

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--chart-1))",
  },
  openTrade: {
    label: "Open Trade",
    color: "hsl(var(--chart-2))",
  },
  closeTrade: {
    label: "Close Trade",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const TradingChart = ({ pair }: { pair: string }) => {
  const { data, trades } = generateTradingData(pair);
  const currentPrice = data[data.length - 1]?.price || 0;
  const previousPrice = data[data.length - 2]?.price || 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = ((priceChange / previousPrice) * 100);
  
  const openTrades = data.filter(d => d.openTrade !== null).length;
  const closeTrades = data.filter(d => d.closeTrade !== null).length;

  const formatTradeDate = (dateString: string) => {
    return new Date(dateString).toISOString().slice(0, 19).replace('T', ' ');
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold">{pair}</div>
            <div className="text-sm text-muted-foreground mt-1">
              ${currentPrice.toLocaleString()} 
              <span className={`ml-2 ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>Opens: {openTrades}</div>
            <div>Closes: {closeTrades}</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }}
                interval={Math.floor(data.length / 6)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                domain={['dataMin - 50', 'dataMax + 50']}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent 
                  formatter={(value, name) => [
                    name === 'price' ? `$${Number(value).toLocaleString()}` : 
                    name === 'openTrade' ? `Open: $${Number(value).toLocaleString()}` :
                    name === 'closeTrade' ? `Close: $${Number(value).toLocaleString()}` : value,
                    name === 'price' ? 'Price' : 
                    name === 'openTrade' ? 'Open Trade' :
                    name === 'closeTrade' ? 'Close Trade' : name
                  ]}
                />}
                labelFormatter={(value) => `Time: ${value}`}
              />
              
              {/* Price line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
                name="price"
              />
              
              {/* Open trade markers */}
              <Line
                type="monotone"
                dataKey="openTrade"
                stroke="hsl(var(--chart-2))"
                strokeWidth={0}
                dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 5 }}
                connectNulls={false}
                name="openTrade"
              />
              
              {/* Close trade markers */}
              <Line
                type="monotone"
                dataKey="closeTrade"
                stroke="hsl(var(--chart-3))"
                strokeWidth={0}
                dot={{ fill: "hsl(var(--chart-3))", strokeWidth: 2, r: 5 }}
                connectNulls={false}
                name="closeTrade"
              />
            </ComposedChart>
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
            Real-time monitoring of trading pairs with open and close positions
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tradingPairs.map((pair) => (
            <TradingChart key={pair} pair={pair} />
          ))}
        </div>
        
        <Card className="p-6">
          <h3 className="font-semibold mb-4 text-lg">Trading Legend & Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Chart Elements</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-0.5 bg-chart-1"></div>
                  <span>Price Movement Line</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-chart-2"></div>
                  <span>Open Trade Position (Buy/Long)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-chart-3"></div>
                  <span>Close Trade Position (Sell/Exit)</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Trading Information</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Charts show 15-minute interval data over the last 25 hours</p>
                <p>• Each card displays recent trades with detailed information</p>
                <p>• LONG trades are shown in green, SHORT trades in red</p>
                <p>• Funding totals show net profit/loss percentage</p>
                <p>• Trade periods indicate duration in 15-minute intervals</p>
                <p>• Hover over charts for detailed price and time information</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;
