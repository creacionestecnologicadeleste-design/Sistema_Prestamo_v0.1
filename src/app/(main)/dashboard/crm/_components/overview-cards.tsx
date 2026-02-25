"use client";

import { format, subMonths } from "date-fns";
import { BadgeDollarSign, Wallet } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, Line, LineChart, XAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import {
  leadsChartConfig,
  leadsChartData,
  proposalsChartConfig,
  proposalsChartData,
  revenueChartConfig,
  revenueChartData,
} from "./crm.config";

const lastMonth = format(subMonths(new Date(), 1), "LLLL");

export function OverviewCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await axios.get("/api/dashboard/stats");
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted/50" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Card>
        <CardHeader>
          <CardTitle>Préstamos Activos</CardTitle>
          <CardDescription>Cantidad Total</CardDescription>
        </CardHeader>
        <CardContent className="size-full">
          <ChartContainer className="size-full min-h-24" config={leadsChartConfig}>
            <BarChart accessibilityLayer data={leadsChartData} barSize={8}>
              <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} hide />
              <ChartTooltip content={<ChartTooltipContent labelFormatter={(label) => `${lastMonth}: ${label}`} />} />
              <Bar
                background={{ fill: "var(--color-background)", radius: 4, opacity: 0.07 }}
                dataKey="newLeads"
                stackId="a"
                fill="var(--color-newLeads)"
                radius={[0, 0, 0, 0]}
              />
              <Bar dataKey="disqualified" stackId="a" fill="var(--color-disqualified)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <span className="font-semibold text-xl tabular-nums">{stats?.activeLoans?.count || 0}</span>
          <span className="font-medium text-green-500 text-sm">--%</span>
        </CardFooter>
      </Card>

      <Card className="overflow-hidden pb-0">
        <CardHeader>
          <CardTitle>Clientes Totales</CardTitle>
          <CardDescription>Base de Datos</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ChartContainer className="size-full min-h-24" config={proposalsChartConfig}>
            <AreaChart
              data={proposalsChartData}
              margin={{
                left: 0,
                right: 0,
                top: 5,
              }}
            >
              <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} hide />
              <ChartTooltip
                content={<ChartTooltipContent labelFormatter={(label) => `${lastMonth}: ${label}`} hideIndicator />}
              />
              <Area
                dataKey="proposalsSent"
                fill="var(--color-proposalsSent)"
                fillOpacity={0.05}
                stroke="var(--color-proposalsSent)"
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex items-center justify-between pb-4 pl-6">
          <span className="font-semibold text-xl tabular-nums">{stats?.totalClients || 0}</span>
          <span className="font-medium text-green-500 text-sm">--%</span>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="w-fit rounded-lg bg-green-500/10 p-2">
            <Wallet className="size-5 text-green-500" />
          </div>
        </CardHeader>
        <CardContent className="flex size-full flex-col justify-between">
          <div className="space-y-1.5">
            <CardTitle>Monto Activo</CardTitle>
            <CardDescription>Cartera en Calle</CardDescription>
          </div>
          <p className="font-medium text-2xl tabular-nums">
            RD$ {(stats?.activeLoans?.amount || 0).toLocaleString()}
          </p>
          <div className="w-fit rounded-md bg-green-500/10 px-2 py-1 font-medium text-green-500 text-xs">--%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="w-fit rounded-lg bg-blue-500/10 p-2">
            <BadgeDollarSign className="size-5 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent className="flex size-full flex-col justify-between">
          <div className="space-y-1.5">
            <CardTitle>Recaudado</CardTitle>
            <CardDescription>Total Pagos</CardDescription>
          </div>
          <p className="font-medium text-2xl tabular-nums">
            RD$ {(stats?.totalCollected || 0).toLocaleString()}
          </p>
          <div className="w-fit rounded-md bg-blue-500/10 px-2 py-1 font-medium text-blue-500 text-xs">--%</div>
        </CardContent>
      </Card>

      <Card className="col-span-1 xl:col-span-2">
        <CardHeader>
          <CardTitle>Crecimiento Cartera</CardTitle>
          <CardDescription>Año Actual</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueChartConfig} className="h-24 w-full">
            <LineChart
              data={revenueChartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                strokeWidth={2}
                dataKey="revenue"
                stroke="var(--color-revenue)"
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-sm">Crecimiento constante</p>
        </CardFooter>
      </Card>
    </div>
  );
}
