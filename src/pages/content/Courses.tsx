import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/image-upload';
import { 
  Search, 
  Plus, 
  GraduationCap, 
  Play, 
  Video, 
  Clock, 
  Users, 
  Star,
  Edit,
  Trash2,
  ImageIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Course, Lesson } from '@/types/course.types';
import TrophyIcon from '@/components/ui/TrophyIcon';

const formatDuration = (seconds: number) => {
  if (!seconds) return '0min';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
};

const getTotalDuration = (lessons: Lesson[]) => {
  if (!lessons || lessons.length === 0) return 'N/A';
  const totalSeconds = lessons.reduce((total, lesson) => total + (lesson.duration_seconds || 0), 0);
  return formatDuration(totalSeconds);
};

const Courses: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    cover_image_url: ''
  });

  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    video_url: '',
    platform: 'youtube',
    duration: '',
    course_id: ''
  });

  // Buscar cursos
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          lessons (*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Course[];
    }
  });

  // Mutation para criar curso
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: typeof newCourse) => {
      // Validação básica
      if (!courseData.title.trim()) {
        throw new Error('Título do curso é obrigatório');
      }

      const { data, error } = await supabase
        .from('courses')
        .insert([{
          title: courseData.title.trim(),
          description: courseData.description.trim() || null,
          cover_image_url: courseData.cover_image_url || null,
          thumbnail_url: courseData.cover_image_url || null, // Usar a mesma imagem como thumbnail
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Curso criado com sucesso! 🎓",
        description: "O novo curso foi adicionado à plataforma.",
      });
      setShowAddCourse(false);
      setNewCourse({ title: '', description: '', cover_image_url: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar curso",
        description: error.message || "Não foi possível criar o curso. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Mutation para criar aula
  const createLessonMutation = useMutation({
    mutationFn: async (lessonData: typeof newLesson) => {
      // Validação básica
      if (!lessonData.title.trim()) {
        throw new Error('Título da aula é obrigatório');
      }
      if (!lessonData.course_id) {
        throw new Error('Selecione um curso para a aula');
      }
      if (!lessonData.video_url.trim()) {
        throw new Error('URL do vídeo é obrigatória');
      }

      const durationInSeconds = lessonData.duration ? 
        parseInt(lessonData.duration.split(':')[0]) * 60 + parseInt(lessonData.duration.split(':')[1] || '0') : 
        null;

      const { data, error } = await supabase
        .from('lessons')
        .insert([{
          course_id: lessonData.course_id,
          title: lessonData.title.trim(),
          description: lessonData.description?.trim() || null,
          video_url: lessonData.video_url.trim(),
          platform: lessonData.platform,
          duration_seconds: durationInSeconds,
          is_active: true,
          order_index: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Aula adicionada com sucesso! 📹",
        description: "A nova aula foi criada e está disponível no curso.",
      });
      setShowAddLesson(false);
      setNewLesson({ title: '', description: '', video_url: '', platform: 'youtube', duration: '', course_id: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar aula",
        description: error.message || "Não foi possível criar a aula. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Filtrar cursos
  const filteredCourses = courses?.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 space-y-6">
      {/* Header com design padrão */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <TrophyIcon className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Academia Elite</h1>
              <p className="text-slate-300 mt-1">Cursos e aulas exclusivas para afiliados de alto desempenho</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin() && (
              <div className="flex gap-2">
                <Dialog open={showAddCourse} onOpenChange={setShowAddCourse}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Curso
                    </Button>
                  </DialogTrigger>
                  {/* Dialog Content aqui... */}
                </Dialog>
                
                <Dialog open={showAddLesson} onOpenChange={setShowAddLesson}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                      <Play className="w-4 h-4 mr-2" />
                      Nova Aula
                    </Button>
                  </DialogTrigger>
                  {/* Dialog Content aqui... */}
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Busca */}
      <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grade de Cursos */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Carregando cursos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="bg-slate-800/60 border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 group cursor-pointer backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white group-hover:text-orange-400 transition-colors">
                        {course.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs bg-slate-700/60 text-slate-300">
                          {course.lessons?.length || 0} aulas
                        </Badge>
                        <Badge variant="outline" className="text-xs border-orange-500/50 text-orange-400">
                          Elite
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {isAdmin() && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-300">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-slate-300 text-sm mb-4">
                  {course.description || "Curso exclusivo para afiliados elite"}
                </p>
                
                <div className="space-y-3">
                  {/* Course Stats */}
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{getTotalDuration(course.lessons || [])}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>Elite</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                      <span>Premium</span>
                    </div>
                  </div>
                  
                  {/* Progress or Access Button */}
                  <div className="pt-2">
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white"
                      onClick={() => navigate(`/dashboard/content/${course.id}`)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Acessar Curso
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">
            {searchTerm ? 'Nenhum curso encontrado' : 'Nenhum curso disponível'}
          </h3>
          <p className="text-slate-400 mb-6">
            {searchTerm 
              ? 'Tente ajustar os termos de busca.' 
              : 'Novos cursos exclusivos estão sendo preparados para você.'
            }
          </p>
          {isAdmin() && !searchTerm && (
            <Button 
              onClick={() => setShowAddCourse(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Curso
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Courses; 