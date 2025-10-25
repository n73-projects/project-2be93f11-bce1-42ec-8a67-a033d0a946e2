import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./components/ui/chart";
import type { ChartConfig } from "./components/ui/chart";
import { ComposedChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

// Trading pairs data
const tradingPairs = ["BTC-USDT", "ETH-USDT", "XMR-USDT"];

// Generate mock trading data for each pair
const generateTradingData = (pair: string) => {
  const basePrice = pair === "BTC-USDT" ? 43000 : pair === "ETH-USDT" ? 2500 : 180;
  const data = [];
  
  // Generate more realistic price movements with trend
  let currentPrice = basePrice;
  const trend = (Math.random() - 0.5) * 0.02; // Small trend factor
  
  for (let i = 0; i < 100; i++) {
    // Price moves with some volatility and trend
    const volatility = 0.02 + Math.random() * 0.03;
    const change = (Math.random() - 0.5) * volatility + trend;
    currentPrice = currentPrice * (1 + change);
    
    const timestamp = new Date(Date.now() - (99 - i) * 15 * 60 * 1000).toISOString(); // 15-minute intervals
    
    // Add realistic trade points - trades are more likely during high volatility
    const volatilityFactor = Math.abs(change) * 50;
    const hasOpenTrade = Math.random() > (0.95 - volatilityFactor);
    const hasCloseTrade = Math.random() > (0.95 - volatilityFactor);
    
    data.push({
      timestamp,
      time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: Math.round(currentPrice * 100) / 100,
      openTrade: hasOpenTrade ? currentPrice : null,
      closeTrade: hasCloseTrade ? currentPrice : null,
      volume: Math.round((Math.random() * 1000 + 100) * 100) / 100,
    });
  }
  
  return data;
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
  const data = generateTradingData(pair);
  const currentPrice = data[data.length - 1]?.price || 0;
  const previousPrice = data[data.length - 2]?.price || 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = ((priceChange / previousPrice) * 100);
  
  const openTrades = data.filter(d => d.openTrade !== null).length;
  const closeTrades = data.filter(d => d.closeTrade !== null).length;
  
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
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
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
                stroke="var(--color-price)"
                strokeWidth={2}
                dot={false}
                name="price"
              />
              
              {/* Open trade markers */}
              <Line
                type="monotone"
                dataKey="openTrade"
                stroke="var(--color-openTrade)"
                strokeWidth={0}
                dot={{ fill: "var(--color-openTrade)", strokeWidth: 2, r: 5 }}
                connectNulls={false}
                name="openTrade"
              />
              
              {/* Close trade markers */}
              <Line
                type="monotone"
                dataKey="closeTrade"
                stroke="var(--color-closeTrade)"
                strokeWidth={0}
                dot={{ fill: "var(--color-closeTrade)", strokeWidth: 2, r: 5 }}
                connectNulls={false}
                name="closeTrade"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
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
        
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
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
                <p>• Trade markers appear during high volatility periods</p>
                <p>• Price changes are calculated from the previous period</p>
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
