import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  MousePointer,
  DollarSign,
  Users,
  Target
} from 'lucide-react';

const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Mock data for demonstration
  const analyticsData = {
    overview: {
      totalClicks: 1580,
      totalConversions: 45,
      totalRevenue: 1250.00,
      conversionRate: 2.85,
      trends: {
        clicks: 12.5,
        conversions: 8.3,
        revenue: 15.2,
        conversionRate: -2.1
      }
    },
    periods: {
      '7d': { label: '7 dias', clicks: [120, 135, 98, 145, 162, 178, 155] },
      '30d': { label: '30 dias', clicks: Array.from({length: 30}, () => Math.floor(Math.random() * 200) + 50) },
      '90d': { label: '90 dias', clicks: Array.from({length: 90}, () => Math.floor(Math.random() * 180) + 60) }
    },
    topProducts: [
      { name: 'Curso Digital Marketing', clicks: 342, conversions: 12, revenue: 380.00 },
      { name: 'E-book SEO Avançado', clicks: 289, conversions: 8, revenue: 240.00 },
      { name: 'Software Analytics', clicks: 156, conversions: 3, revenue: 150.00 },
      { name: 'Template Site', clicks: 98, conversions: 2, revenue: 60.00 }
    ],
    trafficSources: [
      { source: 'Instagram', percentage: 35, clicks: 553 },
      { source: 'Facebook', percentage: 28, clicks: 442 },
      { source: 'YouTube', percentage: 20, clicks: 316 },
      { source: 'Blog', percentage: 12, clicks: 190 },
      { source: 'Email', percentage: 5, clicks: 79 }
    ]
  };

  const periods = [
    { key: '7d', label: '7 dias' },
    { key: '30d', label: '30 dias' },
    { key: '90d', label: '90 dias' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
            <p className="text-slate-400">
              Acompanhe métricas detalhadas de performance dos seus links
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-600 text-slate-300">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" className="border-slate-600 text-slate-300">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {periods.map((period) => (
            <Button
              key={period.key}
              variant={selectedPeriod === period.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period.key)}
              className={selectedPeriod === period.key 
                ? "bg-orange-600 hover:bg-orange-700" 
                : "border-slate-600 text-slate-300 hover:bg-slate-700"
              }
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total de Cliques</p>
                <p className="text-2xl font-bold text-white">{analyticsData.overview.totalClicks.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-orange-400" />
                  <span className="text-xs text-orange-400 font-medium">
                    +{analyticsData.overview.trends.clicks}%
                  </span>
                  <span className="text-xs text-slate-400">vs período anterior</span>
                </div>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <MousePointer className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Conversões</p>
                <p className="text-2xl font-bold text-white">{analyticsData.overview.totalConversions}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-orange-400" />
                  <span className="text-xs text-orange-400 font-medium">
                    +{analyticsData.overview.trends.conversions}%
                  </span>
                  <span className="text-xs text-slate-400">vs período anterior</span>
                </div>
              </div>
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Target className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Receita Total</p>
                <p className="text-2xl font-bold text-white">
                  R$ {analyticsData.overview.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-orange-400" />
                  <span className="text-xs text-orange-400 font-medium">
                    +{analyticsData.overview.trends.revenue}%
                  </span>
                  <span className="text-xs text-slate-400">vs período anterior</span>
                </div>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-white">{analyticsData.overview.conversionRate}%</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingDown className="h-3 w-3 text-red-400" />
                  <span className="text-xs text-red-400 font-medium">
                    {analyticsData.overview.trends.conversionRate}%
                  </span>
                  <span className="text-xs text-slate-400">vs período anterior</span>
                </div>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Performance dos Cliques</CardTitle>
            <CardDescription>Evolução de cliques nos últimos {periods.find(p => p.key === selectedPeriod)?.label}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {analyticsData.periods[selectedPeriod].clicks.slice(-14).map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div 
                    className="bg-gradient-to-t from-orange-600 to-orange-400 rounded-t min-h-[4px] w-full"
                    style={{ height: `${(value / Math.max(...analyticsData.periods[selectedPeriod].clicks)) * 100}%` }}
                  ></div>
                  <span className="text-xs text-slate-400 transform -rotate-45 origin-left">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Fontes de Tráfego</CardTitle>
            <CardDescription>Origem dos seus cliques</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyticsData.trafficSources.map((source, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{source.source}</span>
                  <span className="text-white font-medium">{source.percentage}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                    style={{ width: `${source.percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-400">
                  {source.clicks} cliques
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Top Produtos por Performance</CardTitle>
          <CardDescription>Produtos com melhor performance no período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                    #{index + 1}
                  </Badge>
                  <div>
                    <h3 className="font-semibold text-white">{product.name}</h3>
                    <p className="text-sm text-slate-400">
                      {product.clicks} cliques • {product.conversions} conversões
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-orange-400 font-semibold">
                    R$ {product.revenue.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {((product.conversions / product.clicks) * 100).toFixed(1)}% taxa
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            💡 Insights Automáticos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
            <p>Seu melhor horário para conversões é entre 14h-16h</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
            <p>Instagram está gerando 35% dos seus cliques - considere focar mais nesta plataforma</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
            <p>Produtos digitais têm taxa de conversão 40% maior que produtos físicos</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
            <p>Sua receita aumentou 15% na última semana - continue com a estratégia atual</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics; 