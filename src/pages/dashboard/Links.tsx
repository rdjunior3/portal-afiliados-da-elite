import React, { useState } from 'react';
import { useAffiliateLinks } from '@/hooks/useAffiliateLinks';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Copy,
  ExternalLink,
  TrendingUp,
  DollarSign,
  MousePointer,
  Link as LinkIcon,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  BarChart3,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Links: React.FC = () => {
  const { userLinks, linkStats, isLoadingLinks } = useAffiliateLinks();
  const { track } = useAnalytics();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const copyToClipboard = (text: string, linkId: string) => {
    navigator.clipboard.writeText(text);
    track('affiliate_link_copied', {
      linkId,
      linkLength: text.length,
      source: 'links_page'
    });
    toast({
      title: "Copiado!",
      description: "Link copiado para a área de transferência.",
    });
  };

  // Filter links based on search
  const filteredLinks = userLinks.filter(link => 
    link.products?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.full_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mock additional data for demonstration
  const enhancedLinks = filteredLinks.map(link => ({
    ...link,
    last_click: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    conversion_rate: link.clicks_count > 0 ? (link.conversions_count / link.clicks_count * 100) : 0,
    avg_daily_clicks: Math.floor(Math.random() * 20) + 1
  }));

  const totalStats = {
    totalClicks: linkStats?.totalClicks || 0,
    totalConversions: linkStats?.totalConversions || 0,
    totalRevenue: linkStats?.totalRevenue || 0,
    totalLinks: linkStats?.totalLinks || 0
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Meus Links</h1>
            <p className="text-slate-400">
              Gerencie todos os seus links de afiliado e acompanhe o desempenho
            </p>
          </div>
          <Button 
            onClick={() => navigate('/dashboard/products')}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar Novo Link
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <LinkIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalStats.totalLinks}</p>
                  <p className="text-sm text-slate-400">Links Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <MousePointer className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalStats.totalClicks.toLocaleString()}</p>
                  <p className="text-sm text-slate-400">Total de Cliques</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalStats.totalConversions}</p>
                  <p className="text-sm text-slate-400">Conversões</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <DollarSign className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    R$ {totalStats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-slate-400">Receita Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por produto ou URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            <Button 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => navigate('/dashboard/analytics')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Ver Analytics Detalhado
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Links List */}
      <div className="space-y-4">
        {isLoadingLinks ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="bg-slate-700/50 h-4 rounded w-1/3"></div>
                  <div className="bg-slate-700/50 h-3 rounded w-2/3"></div>
                  <div className="flex justify-between">
                    <div className="bg-slate-700/50 h-8 rounded w-32"></div>
                    <div className="bg-slate-700/50 h-8 rounded w-24"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : enhancedLinks.length === 0 ? (
          // No links
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-12 text-center">
              <LinkIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchTerm ? 'Nenhum link encontrado' : 'Você ainda não tem links'}
              </h3>
              <p className="text-slate-400 mb-4">
                {searchTerm 
                  ? 'Tente ajustar sua busca ou limpar os filtros'
                  : 'Comece criando seu primeiro link de afiliado'
                }
              </p>
              <Button
                onClick={() => {
                  if (searchTerm) {
                    setSearchTerm('');
                  } else {
                    navigate('/dashboard/products');
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {searchTerm ? 'Limpar Busca' : 'Criar Primeiro Link'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Links
          enhancedLinks.map((link) => (
            <Card 
              key={link.id} 
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Product Info */}
                    <div>
                      <h3 className="font-semibold text-white text-lg mb-1">
                        {link.products?.name || 'Produto não encontrado'}
                      </h3>
                      <p className="text-sm text-slate-400 font-mono bg-slate-900/50 px-2 py-1 rounded">
                        {link.full_url}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Cliques</p>
                        <p className="text-white font-semibold">{link.clicks_count.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Conversões</p>
                        <p className="text-white font-semibold">{link.conversions_count}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Taxa Conv.</p>
                        <p className="text-white font-semibold">{link.conversion_rate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Receita</p>
                        <p className="text-orange-400 font-semibold">
                          R$ {link.revenue_generated.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Último Clique</p>
                        <p className="text-white font-semibold">
                          {link.last_click.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    {/* Performance Badges */}
                    <div className="flex flex-wrap gap-2">
                      {link.conversion_rate > 5 && (
                        <Badge className="bg-orange-500/20 text-orange-400">
                          Alta Conversão
                        </Badge>
                      )}
                      {link.clicks_count > 100 && (
                        <Badge className="bg-blue-500/20 text-blue-400">
                          Popular
                        </Badge>
                      )}
                      {link.avg_daily_clicks > 10 && (
                        <Badge className="bg-purple-500/20 text-purple-400">
                          Trending
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(link.full_url, link.id)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(link.full_url, '_blank')}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Tips */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            💡 Dicas para Otimizar seus Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-300">
          <p>• Use links em conteúdo relevante para aumentar as conversões</p>
          <p>• Monitore regularmente o desempenho e ajuste sua estratégia</p>
          <p>• Teste diferentes produtos para encontrar os que convertem melhor</p>
          <p>• Compartilhe seus links em múltiplas plataformas</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Links; 