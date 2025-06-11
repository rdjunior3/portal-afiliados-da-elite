import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Clock } from 'lucide-react';

const ManageAffiliates: React.FC = () => {
  return (
    <PageLayout
      headerContent={
        <PageHeader
          title="Gerenciar Afiliados"
          description="Esta funcionalidade está temporariamente desabilitada."
          customIcon={<Shield className="w-6 h-6" color="#64748b" />}
        />
      }
    >
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Clock className="w-16 h-16 text-slate-400 mb-4" />
            <h2 className="text-xl font-semibold text-slate-300 mb-2">
              Funcionalidade Temporariamente Desabilitada
            </h2>
            <p className="text-slate-400 text-center max-w-md">
              O gerenciamento de afiliados está temporariamente desabilitado e será habilitado em uma versão futura da plataforma.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ManageAffiliates; 