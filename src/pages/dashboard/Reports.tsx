import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, BarChart3, Zap, Settings } from 'lucide-react';

const Reports: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Relatórios de Performance</h1>
          <p className="text-slate-400">
            Visualize seus resultados através de integrações externas
          </p>
        </div>
        <Badge variant="outline" className="border-orange-500/50 text-orange-300">
          Em Desenvolvimento
        </Badge>
      </div>

      {/* Integração Externa - Informativo */}
      <Card className="bg-gradient-to-br from-blue-500/15 to-blue-600/10 border-blue-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ExternalLink className="h-6 w-6 text-blue-400" />
            Sistema de Relatórios via Integração
          </CardTitle>
          <CardDescription className="text-blue-100">
            Os dados de vendas e performance serão sincronizados automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-100 font-medium mb-3">Como funcionará:</h4>
            <ul className="text-sm text-blue-200 space-y-2">
              <li>• Sincronização automática com plataformas como Braip</li>
              <li>• Relatórios de vendas em tempo real via webhook</li>
              <li>• Dashboard interativo com métricas de performance</li>
              <li>• Histórico completo de comissões e pagamentos</li>
              <li>• Exportação de dados em múltiplos formatos</li>
            </ul>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-5 w-5 text-blue-400" />
            <span className="text-blue-200">
              <strong>Status:</strong> Sistema em desenvolvimento para integração via webhook
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Funcionalidades Futuras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm opacity-75">
          <CardHeader>
            <CardTitle className="text-slate-300 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-400" />
              Relatório de Vendas
            </CardTitle>
            <CardDescription>
              Acompanhe suas vendas e conversões em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full" variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Em Breve
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm opacity-75">
          <CardHeader>
            <CardTitle className="text-slate-300 flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-400" />
              Performance de Links
            </CardTitle>
            <CardDescription>
              Análise detalhada de cliques e conversões por link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full" variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Em Breve
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm opacity-75">
          <CardHeader>
            <CardTitle className="text-slate-300 flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-400" />
              Relatórios Customizados
            </CardTitle>
            <CardDescription>
              Crie relatórios personalizados para suas necessidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full" variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Em Breve
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status Atual */}
      <Card className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 border border-orange-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-400" />
            Enquanto isso...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-orange-100">
            Concentre-se em criar links de afiliado e promover os produtos. 
            Quando o sistema de relatórios estiver pronto, todos os dados serão 
            sincronizados automaticamente.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => window.location.href = '/dashboard/products'}
            >
              Explorar Produtos
            </Button>
            <Button 
              variant="outline" 
              className="border-orange-500/50 text-orange-300 hover:bg-orange-500/10"
              onClick={() => window.location.href = '/dashboard/profile'}
            >
              Completar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports; 