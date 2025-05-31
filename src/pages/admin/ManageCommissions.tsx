import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, CheckCircle } from 'lucide-react';

const ManageCommissions = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-orange">
            Gerenciar Comissões
          </h1>
          <p className="text-muted-foreground mt-2">
            Revise e aprove comissões pendentes dos afiliados
          </p>
        </div>
        <Button className="gradient-orange glow-orange-hover">
          <CheckCircle className="h-4 w-4 mr-2" />
          Aprovar Selecionadas
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
            <DollarSign className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Em breve você poderá gerenciar e aprovar todas as comissões pendentes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageCommissions; 