import { useGetAnalyticsSummary, useGetProfitsChart, useGetTopCities, useGetTopProducts } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { Loader2, TrendingUp, TrendingDown, Package, MapPin } from "lucide-react"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

export function AnalyticsPage() {
  const { data: summary, isLoading: sumLoading } = useGetAnalyticsSummary()
  const { data: chartData, isLoading: chartLoading } = useGetProfitsChart()
  const { data: topCities, isLoading: citiesLoading } = useGetTopCities()
  const { data: topProducts, isLoading: productsLoading } = useGetTopProducts()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Deep dive into your business metrics and growth.</p>
      </div>

      {/* KPI Row */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Delivery Rate" 
          value={summary ? `${summary.deliveryRate}%` : "—"}
          desc="Of shipped orders"
          trend="up"
          loading={sumLoading}
        />
        <MetricCard 
          title="Return Rate" 
          value={summary ? `${summary.returnRate}%` : "—"}
          desc="Of shipped orders"
          trend="down"
          loading={sumLoading}
        />
        <MetricCard 
          title="Total Delivered" 
          value={summary?.totalDelivered.toString() || "—"}
          desc="Lifetime delivered"
          loading={sumLoading}
        />
        <MetricCard 
          title="Total Returned" 
          value={summary?.totalReturned.toString() || "—"}
          desc="Lifetime returned"
          loading={sumLoading}
        />
      </div>

      {/* Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Profit & Volume (Last 30 Days)</CardTitle>
          <CardDescription>Daily profit margin vs number of delivered orders</CardDescription>
        </CardHeader>
        <CardContent>
          {chartLoading ? (
            <div className="h-[350px] flex items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="profit" name="Profit (DZD)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tables Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" /> Top Cities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {citiesLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCities?.map(city => (
                    <TableRow key={city.city}>
                      <TableCell className="font-medium">{city.city}</TableCell>
                      <TableCell className="text-right">{city.orders}</TableCell>
                      <TableCell className="text-right text-primary font-bold tracking-tight">
                        {formatCurrency(city.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-5 text-primary" /> Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts?.map(prod => (
                    <TableRow key={prod.productId}>
                      <TableCell className="font-medium line-clamp-1 max-w-[200px]">{prod.productName}</TableCell>
                      <TableCell className="text-right">{prod.sales}</TableCell>
                      <TableCell className="text-right text-primary font-bold tracking-tight">
                        {formatCurrency(prod.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ title, value, desc, trend, loading }: { title: string, value: string, desc: string, trend?: 'up' | 'down', loading?: boolean }) {
  return (
    <Card className="bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight">{value}</span>
              {trend === 'up' && <TrendingUp className="size-4 text-emerald-500" />}
              {trend === 'down' && <TrendingDown className="size-4 text-destructive" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{desc}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
