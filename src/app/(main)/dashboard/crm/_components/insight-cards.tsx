import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Bar, BarChart, CartesianGrid, Label, LabelList, Pie, PieChart, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function InsightCards() {
  const { data: loanMethods, isLoading: isLoadingMethods } = useQuery({
    queryKey: ["loan-methods"],
    queryFn: async () => {
      const { data } = await axios.get("/api/dashboard/loan-methods");
      return data;
    },
  });

  const { data: disbursements, isLoading: isLoadingDisbursements } = useQuery({
    queryKey: ["disbursements"],
    queryFn: async () => {
      const { data } = await axios.get("/api/dashboard/disbursements");
      return data;
    },
  });

  const totalLoans = loanMethods?.reduce((acc: number, curr: any) => acc + curr.value, 0) || 0;

  if (isLoadingMethods || isLoadingDisbursements) {
    return <div className="h-48 w-full animate-pulse bg-muted rounded-xl" />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs sm:grid-cols-2 xl:grid-cols-5">
      <Card className="col-span-1 xl:col-span-2">
        <CardHeader>
          <CardTitle>Métodos de Amortización</CardTitle>
        </CardHeader>
        <CardContent className="max-h-48">
          <ChartContainer config={{}} className="size-full">
            <PieChart
              className="m-0"
              margin={{
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={loanMethods}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={2}
                cornerRadius={4}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground font-bold text-3xl tabular-nums"
                          >
                            {totalLoans}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 24} className="fill-muted-foreground">
                            Préstamos
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
              <ChartLegend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                content={() => (
                  <ul className="ml-8 flex flex-col gap-3">
                    {loanMethods?.map((item: any) => (
                      <li key={item.name} className="flex w-36 items-center justify-between">
                        <span className="flex items-center gap-2 capitalize">
                          <span className="size-2.5 rounded-full" style={{ background: item.fill }} />
                          {item.name}
                        </span>
                        <span className="tabular-nums">{item.value}</span>
                      </li>
                    ))}
                  </ul>
                )}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="gap-2">
          <Button size="sm" variant="outline" className="basis-1/2 text-xs">
            Ver Reporte
          </Button>
          <Button size="sm" variant="outline" className="basis-1/2 text-xs">
            Descargar CSV
          </Button>
        </CardFooter>
      </Card>

      <Card className="col-span-1 xl:col-span-3">
        <CardHeader>
          <CardTitle>Desembolsos Mensuales</CardTitle>
        </CardHeader>
        <CardContent className="size-full max-h-52">
          <ChartContainer config={{}} className="size-full">
            <BarChart accessibilityLayer data={disbursements} layout="vertical">
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="month"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                hide
              />
              <XAxis dataKey="amount" type="number" hide />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <Bar dataKey="amount" layout="vertical" fill="var(--chart-1)" radius={[0, 6, 6, 0]}>
                <LabelList
                  dataKey="month"
                  position="insideLeft"
                  offset={8}
                  className="fill-primary-foreground text-xs"
                />
                <LabelList
                  dataKey="amount"
                  position="insideRight"
                  offset={8}
                  className="fill-primary-foreground text-xs tabular-nums"
                  formatter={(value: number) => `RD$ ${value.toLocaleString()}`}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-xs">Resumen de los últimos 6 meses de actividad crediticia.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
