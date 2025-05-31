import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';

const Reports: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Relatórios</h1>
          <p className="text-slate-400">
            Gere e baixe relatórios detalhados de performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              Relatório de Performance
            </CardTitle>
            <CardDescription>
              Análise completa de cliques, conversões e receita
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-orange-600 hover:bg-orange-700">
              <Download className="mr-2 h-4 w-4" />
              Baixar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Relatório de Comissões
            </CardTitle>
            <CardDescription>
              Histórico detalhado de todas as comissões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" />
              Baixar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              Relatório Mensal
            </CardTitle>
            <CardDescription>
              Resumo consolidado do mês atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <Download className="mr-2 h-4 w-4" />
              Baixar Relatório
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
        <CardHeader>
          <CardTitle className="text-white">📊 Em Breve</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300">
          <p>Relatórios customizáveis e automáticos em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports; 