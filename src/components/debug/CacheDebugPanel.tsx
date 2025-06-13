/**
 * Painel de Debug para Cache - Apenas em Desenvolvimento
 * Permite monitorar performance e estatísticas do cache
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCacheStats, useCacheManagement } from '@/hooks/useOptimizedQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// Componente que só renderiza em desenvolvimento
const CacheDebugPanel: React.FC = () => {
  // Retornar null se não estiver em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const { data: stats, refetch } = useCacheStats();
  const { clearAllCache, clearUserCache, clearProductsCache, cleanup, getStats } = useCacheManagement();
  const [isVisible, setIsVisible] = useState(false);
  const [realTimeStats, setRealTimeStats] = useState<any>(null);

  // Atualizar estatísticas em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const currentStats = getStats();
      setRealTimeStats(currentStats);
    }, 2000);

    return () => clearInterval(interval);
  }, [getStats]);

  // Atalho de teclado para mostrar/ocultar painel
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-black/80 text-white border-gray-600 hover:bg-black/90"
        >
          🗄️ Cache Debug
        </Button>
      </div>
    );
  }

  const currentStats = realTimeStats || stats;
  const hitRate = currentStats?.hitRate || 0;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-auto">
      <Card className="bg-black/90 text-white border-gray-600 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              🗄️ Cache Debug Panel
            </CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            Ctrl+Shift+C para alternar | Apenas em desenvolvimento
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="stats" className="text-xs">Estatísticas</TabsTrigger>
              <TabsTrigger value="actions" className="text-xs">Ações</TabsTrigger>
              <TabsTrigger value="monitor" className="text-xs">Monitor</TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-3">
              {/* Hit Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Hit Rate</span>
                  <Badge variant={hitRate > 70 ? "default" : hitRate > 40 ? "secondary" : "destructive"}>
                    {hitRate.toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={hitRate} className="h-2" />
              </div>

              {/* Estatísticas Gerais */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-green-400 font-mono">{currentStats?.hits || 0}</div>
                  <div className="text-xs text-gray-400">Cache Hits</div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-red-400 font-mono">{currentStats?.misses || 0}</div>
                  <div className="text-xs text-gray-400">Cache Misses</div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-blue-400 font-mono">{currentStats?.size || 0}</div>
                  <div className="text-xs text-gray-400">Items Cached</div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-yellow-400 font-mono">{currentStats?.sets || 0}</div>
                  <div className="text-xs text-gray-400">Cache Sets</div>
                </div>
              </div>

              {/* Eficiência */}
              <div className="text-xs text-gray-400 space-y-1">
                <div>Total Operations: {(currentStats?.hits || 0) + (currentStats?.misses || 0)}</div>
                <div>Deletes: {currentStats?.deletes || 0}</div>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-3">
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    cleanup();
                    refetch();
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                >
                  🧹 Cleanup Expired
                </Button>

                <Button
                  onClick={() => {
                    clearProductsCache();
                    refetch();
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                >
                  🛍️ Clear Products Cache
                </Button>

                <Button
                  onClick={() => {
                    clearAllCache();
                    refetch();
                  }}
                  variant="destructive"
                  size="sm"
                  className="w-full text-xs"
                >
                  🗑️ Clear All Cache
                </Button>
              </div>

              <div className="text-xs text-gray-400 p-2 bg-gray-800 rounded">
                <div className="font-semibold mb-1">Dicas:</div>
                <ul className="space-y-1">
                  <li>• Hit rate &gt; 70% = Excelente</li>
                  <li>• Hit rate &gt; 40% = Bom</li>
                  <li>• Hit rate &lt; 40% = Revisar TTL</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="monitor" className="space-y-3">
              <div className="text-xs space-y-2">
                <div className="bg-gray-800 p-2 rounded">
                  <div className="font-semibold text-green-400 mb-1">Cache Performance</div>
                  <div className="space-y-1">
                    <div>Efficiency: {hitRate > 70 ? '🟢 Excellent' : hitRate > 40 ? '🟡 Good' : '🔴 Poor'}</div>
                    <div>Memory Usage: {currentStats?.size || 0} items</div>
                    <div>Last Update: {new Date().toLocaleTimeString()}</div>
                  </div>
                </div>

                <div className="bg-gray-800 p-2 rounded">
                  <div className="font-semibold text-blue-400 mb-1">Recommendations</div>
                  <div className="space-y-1 text-xs">
                    {hitRate < 40 && (
                      <div className="text-red-400">• Consider increasing TTL values</div>
                    )}
                    {(currentStats?.size || 0) > 100 && (
                      <div className="text-yellow-400">• High memory usage - consider cleanup</div>
                    )}
                    {hitRate > 80 && (
                      <div className="text-green-400">• Cache working optimally!</div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-800 p-2 rounded">
                  <div className="font-semibold text-purple-400 mb-1">Debug Info</div>
                  <div className="text-xs font-mono">
                    <div>ENV: {process.env.NODE_ENV}</div>
                    <div>Timestamp: {Date.now()}</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CacheDebugPanel; 