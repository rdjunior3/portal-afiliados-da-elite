import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Send } from 'lucide-react';

const ManagePayments = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-orange">
            Gerenciar Pagamentos
          </h1>
          <p className="text-muted-foreground mt-2">
            Processe e registre pagamentos aos afiliados
          </p>
        </div>
        <Button className="gradient-orange glow-orange-hover">
          <Send className="h-4 w-4 mr-2" />
          Processar Pagamentos
        </Button>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>
            Esta funcionalidade está sendo desenvolvida
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Em breve você poderá processar e gerenciar todos os pagamentos aos afiliados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagePayments; 