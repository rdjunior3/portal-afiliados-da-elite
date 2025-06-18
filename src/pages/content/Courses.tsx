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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
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
  ImageIcon,
  BookOpen,
  MoreVertical
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import TrophyIcon from '@/components/ui/TrophyIcon';

// Definindo tipos locais baseados na estrutura do banco
interface Course {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  thumbnail_url?: string;
  is_active: boolean;
  is_free: boolean;
  price: number;
  enrollment_count?: number;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url: string;
  video_duration?: number;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

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
  const totalSeconds = lessons.reduce((total, lesson) => total + (lesson.video_duration || 0), 0);
  return formatDuration(totalSeconds);
};

const Courses: React.FC = () => {
  const { canManageContent } = useAuth();
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

  // Mutation para criar curso (módulo)
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: typeof newCourse) => {
      // Validação básica
      if (!courseData.title.trim()) {
        throw new Error('Título do módulo é obrigatório');
      }

      const { data, error } = await supabase
        .from('courses')
        .insert([{
          title: courseData.title.trim(),
          description: courseData.description.trim() || null,
          cover_image_url: courseData.cover_image_url || null,
          thumbnail_url: courseData.cover_image_url || null,
          is_active: true,
          is_free: true,
          price: 0,
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
        title: "Módulo criado com sucesso! 🎓",
        description: "O novo módulo foi adicionado à plataforma.",
      });
      setShowAddCourse(false);
      setNewCourse({ title: '', description: '', cover_image_url: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar módulo",
        description: error.message || "Não foi possível criar o módulo. Tente novamente.",
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
        throw new Error('Selecione um módulo para a aula');
      }
      if (!lessonData.video_url.trim()) {
        throw new Error('URL do vídeo é obrigatória');
      }

      // Converter duração MM:SS para segundos
      const durationInSeconds = lessonData.duration ? 
        (() => {
          const parts = lessonData.duration.split(':').map(p => parseInt(p) || 0);
          if (parts.length === 2) {
            return parts[0] * 60 + parts[1]; // MM:SS
          } else if (parts.length === 1) {
            return parts[0] * 60; // apenas minutos
          }
          return 0;
        })() : 0;

      // Obter o próximo order_index
      const { data: existingLessons } = await supabase
        .from('lessons')
        .select('order_index')
        .eq('course_id', lessonData.course_id)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrderIndex = (existingLessons?.[0]?.order_index || 0) + 1;

      const { data, error } = await supabase
        .from('lessons')
        .insert([{
          course_id: lessonData.course_id,
          title: lessonData.title.trim(),
          description: lessonData.description?.trim() || null,
          video_url: lessonData.video_url.trim(),
          video_duration: durationInSeconds,
          is_active: true,
          order_index: nextOrderIndex,
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
        description: "A nova aula foi criada e está disponível no módulo.",
      });
      setShowAddLesson(false);
      setNewLesson({ title: '', description: '', video_url: '', duration: '', course_id: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar aula",
        description: error.message || "Não foi possível criar a aula. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Estados para edição
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [showEditLesson, setShowEditLesson] = useState(false);
  
  // Estados para exclusão
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);

  // Mutation para editar curso
  const editCourseMutation = useMutation({
    mutationFn: async (courseData: { id: string; title: string; description: string; cover_image_url: string }) => {
      const { data, error } = await supabase
        .from('courses')
        .update({
          title: courseData.title.trim(),
          description: courseData.description?.trim() || null,
          cover_image_url: courseData.cover_image_url || null,
          thumbnail_url: courseData.cover_image_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Módulo atualizado! ✏️",
        description: "As alterações foram salvas com sucesso.",
      });
      setShowEditCourse(false);
      setEditingCourse(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao editar módulo",
        description: error.message || "Não foi possível atualizar o módulo.",
        variant: "destructive",
      });
    }
  });

  // Mutation para editar aula
  const editLessonMutation = useMutation({
    mutationFn: async (lessonData: { id: string; title: string; description: string; video_url: string; duration: string }) => {
      const durationInSeconds = lessonData.duration ? 
        (() => {
          const parts = lessonData.duration.split(':').map(p => parseInt(p) || 0);
          if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
          } else if (parts.length === 1) {
            return parts[0] * 60;
          }
          return 0;
        })() : 0;

      const { data, error } = await supabase
        .from('lessons')
        .update({
          title: lessonData.title.trim(),
          description: lessonData.description?.trim() || null,
          video_url: lessonData.video_url.trim(),
          video_duration: durationInSeconds,
          updated_at: new Date().toISOString()
        })
        .eq('id', lessonData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Aula atualizada! ✏️",
        description: "As alterações foram salvas com sucesso.",
      });
      setShowEditLesson(false);
      setEditingLesson(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao editar aula",
        description: error.message || "Não foi possível atualizar a aula.",
        variant: "destructive",
      });
    }
  });

  // Mutation para excluir curso
  const deleteCourse = useMutation({
    mutationFn: async (courseId: string) => {
      // Primeiro, excluir todas as aulas do curso
      const { error: lessonsError } = await supabase
        .from('lessons')
        .delete()
        .eq('course_id', courseId);

      if (lessonsError) throw lessonsError;

      // Depois, excluir o curso
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Módulo excluído! 🗑️",
        description: "O módulo e todas suas aulas foram removidos.",
      });
      setCourseToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir módulo",
        description: error.message || "Não foi possível excluir o módulo.",
        variant: "destructive",
      });
    }
  });

  // Mutation para excluir aula
  const deleteLesson = useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Aula excluída! 🗑️",
        description: "A aula foi removida do módulo.",
      });
      setLessonToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir aula",
        description: error.message || "Não foi possível excluir a aula.",
        variant: "destructive",
      });
    }
  });

  // Funções auxiliares
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowEditCourse(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setShowEditLesson(true);
  };

  const formatDurationForInput = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Filtrar cursos
  const filteredCourses = courses?.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <PageLayout
      headerContent={
        <div className="flex items-center justify-between">
          <PageHeader
            title="Área de Conteúdo - Módulos e Aulas"
            description="Gerencie os módulos de aprendizado e suas respectivas aulas."
            customIcon={<GraduationCap className="w-6 h-6" color="#f97316" />}
          />
          
          {canManageContent() && (
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowAddLesson(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Aula
              </Button>
              <Button 
                onClick={() => setShowAddCourse(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Módulo
              </Button>
            </div>
          )}
        </div>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Filtros */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar módulos ou aulas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700"
            />
          </div>
        </div>
        
        {/* Grid de Cursos */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-slate-800 border-slate-700 animate-pulse">
                <div className="h-48 bg-slate-700 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-700 rounded mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-slate-700 rounded w-16"></div>
                    <div className="h-6 bg-slate-700 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="bg-slate-800 border-slate-700 hover:border-orange-500/50 transition-colors">
                <div className="relative h-48 bg-gradient-to-br from-orange-500/20 to-blue-600/20 rounded-t-lg overflow-hidden">
                  {course.cover_image_url ? (
                    <img 
                      src={course.cover_image_url} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-orange-600/90 text-white">
                      {course.lessons?.length || 0} aulas
                    </Badge>
                    {canManageContent() && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0 text-white hover:bg-black/20">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                          <DropdownMenuItem 
                            onClick={() => handleEditCourse(course)}
                            className="text-slate-200 hover:bg-slate-700"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar Módulo
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setCourseToDelete(course)}
                            className="text-red-400 hover:bg-slate-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir Módulo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {course.description || 'Sem descrição disponível'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-300 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {getTotalDuration(course.lessons || [])}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.enrollment_count || 0}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      onClick={() => navigate(`/content/courses/${course.id}`)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Acessar Módulo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              {courses?.length === 0 ? 'Nenhum módulo cadastrado' : 'Nenhum módulo encontrado'}
            </h3>
            <p className="text-slate-400 mb-6">
              {courses?.length === 0 
                ? 'Comece criando seu primeiro módulo de conteúdo.'
                : 'Tente ajustar o termo de busca.'
              }
            </p>
            {courses?.length === 0 && canManageContent() && (
                <Button 
                  onClick={() => setShowAddCourse(true)}
                className="bg-orange-600 hover:bg-orange-700"
                >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Módulo
                </Button>
              )}
          </div>
        )}
      </div>

      {/* Modal para criar curso/módulo */}
      <Dialog open={showAddCourse} onOpenChange={setShowAddCourse}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-orange-400">Criar Novo Módulo</DialogTitle>
            <DialogDescription className="text-slate-300">
              Crie um novo módulo de conteúdo para a plataforma de afiliados
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="course-title" className="text-slate-300">Título do Módulo *</Label>
              <Input
                id="course-title"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                placeholder="Ex: Fundamentos do Marketing Digital"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div>
              <Label htmlFor="course-description" className="text-slate-300">Descrição</Label>
              <Textarea
                id="course-description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                placeholder="Descreva o conteúdo deste módulo..."
                className="bg-slate-800 border-slate-700 h-20"
              />
            </div>
            <div>
              <Label htmlFor="course-image" className="text-slate-300">URL da Imagem de Capa</Label>
              <Input
                id="course-image"
                value={newCourse.cover_image_url}
                onChange={(e) => setNewCourse({ ...newCourse, cover_image_url: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
                className="bg-slate-800 border-slate-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCourse(false)} className="border-slate-700">
              Cancelar
            </Button>
            <Button 
              onClick={() => createCourseMutation.mutate(newCourse)}
              disabled={createCourseMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {createCourseMutation.isPending ? 'Criando...' : 'Criar Módulo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para criar aula */}
      <Dialog open={showAddLesson} onOpenChange={setShowAddLesson}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-blue-400">Adicionar Nova Aula</DialogTitle>
            <DialogDescription className="text-slate-300">
              Adicione uma nova aula de vídeo a um módulo existente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lesson-course" className="text-slate-300">Módulo *</Label>
              <Select value={newLesson.course_id} onValueChange={(value) => setNewLesson({ ...newLesson, course_id: value })}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Selecione o módulo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {courses?.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lesson-title" className="text-slate-300">Título da Aula *</Label>
              <Input
                id="lesson-title"
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                placeholder="Ex: Introdução ao SEO"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div>
              <Label htmlFor="lesson-description" className="text-slate-300">Descrição</Label>
              <Textarea
                id="lesson-description"
                value={newLesson.description}
                onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                placeholder="Descreva o conteúdo desta aula..."
                className="bg-slate-800 border-slate-700 h-20"
              />
            </div>
            <div>
              <Label htmlFor="lesson-video" className="text-slate-300">URL do Vídeo *</Label>
              <Input
                id="lesson-video"
                value={newLesson.video_url}
                onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div>
              <Label htmlFor="lesson-duration" className="text-slate-300">Duração (MM:SS)</Label>
              <Input
                id="lesson-duration"
                value={newLesson.duration}
                onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
                placeholder="Ex: 15:30"
                className="bg-slate-800 border-slate-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLesson(false)} className="border-slate-700">
              Cancelar
            </Button>
            <Button 
              onClick={() => createLessonMutation.mutate(newLesson)}
              disabled={createLessonMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createLessonMutation.isPending ? 'Criando...' : 'Criar Aula'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar curso/módulo */}
      <Dialog open={showEditCourse} onOpenChange={setShowEditCourse}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-orange-400">Editar Módulo</DialogTitle>
            <DialogDescription className="text-slate-300">
              Edite as informações do módulo de conteúdo
            </DialogDescription>
          </DialogHeader>
          {editingCourse && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-course-title" className="text-slate-300">Título do Módulo *</Label>
                <Input
                  id="edit-course-title"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  placeholder="Ex: Fundamentos do Marketing Digital"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div>
                <Label htmlFor="edit-course-description" className="text-slate-300">Descrição</Label>
                <Textarea
                  id="edit-course-description"
                  value={editingCourse.description || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  placeholder="Descreva o conteúdo deste módulo..."
                  className="bg-slate-800 border-slate-700 h-20"
                />
              </div>
              <div>
                <Label htmlFor="edit-course-image" className="text-slate-300">URL da Imagem de Capa</Label>
                <Input
                  id="edit-course-image"
                  value={editingCourse.cover_image_url || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, cover_image_url: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditCourse(false)} className="border-slate-700">
              Cancelar
            </Button>
            <Button 
              onClick={() => editingCourse && editCourseMutation.mutate({
                id: editingCourse.id,
                title: editingCourse.title,
                description: editingCourse.description || '',
                cover_image_url: editingCourse.cover_image_url || ''
              })}
              disabled={editCourseMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {editCourseMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar aula */}
      <Dialog open={showEditLesson} onOpenChange={setShowEditLesson}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-blue-400">Editar Aula</DialogTitle>
            <DialogDescription className="text-slate-300">
              Edite as informações da aula
            </DialogDescription>
          </DialogHeader>
          {editingLesson && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-lesson-title" className="text-slate-300">Título da Aula *</Label>
                <Input
                  id="edit-lesson-title"
                  value={editingLesson.title}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  placeholder="Ex: Introdução ao SEO"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div>
                <Label htmlFor="edit-lesson-description" className="text-slate-300">Descrição</Label>
                <Textarea
                  id="edit-lesson-description"
                  value={editingLesson.description || ''}
                  onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                  placeholder="Descreva o conteúdo desta aula..."
                  className="bg-slate-800 border-slate-700 h-20"
                />
              </div>
              <div>
                <Label htmlFor="edit-lesson-video" className="text-slate-300">URL do Vídeo *</Label>
                <Input
                  id="edit-lesson-video"
                  value={editingLesson.video_url}
                  onChange={(e) => setEditingLesson({ ...editingLesson, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div>
                <Label htmlFor="edit-lesson-duration" className="text-slate-300">Duração (MM:SS)</Label>
                <Input
                  id="edit-lesson-duration"
                  value={editingLesson.video_duration ? formatDurationForInput(editingLesson.video_duration) : ''}
                  onChange={(e) => setEditingLesson({ ...editingLesson, video_duration: (() => {
                    const parts = e.target.value.split(':').map(p => parseInt(p) || 0);
                    if (parts.length === 2) {
                      return parts[0] * 60 + parts[1];
                    }
                    return parts[0] * 60 || 0;
                  })() })}
                  placeholder="Ex: 15:30"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditLesson(false)} className="border-slate-700">
              Cancelar
            </Button>
            <Button 
              onClick={() => editingLesson && editLessonMutation.mutate({
                id: editingLesson.id,
                title: editingLesson.title,
                description: editingLesson.description || '',
                video_url: editingLesson.video_url,
                duration: editingLesson.video_duration ? formatDurationForInput(editingLesson.video_duration) : ''
              })}
              disabled={editLessonMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editLessonMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para excluir curso */}
      <AlertDialog open={!!courseToDelete} onOpenChange={() => setCourseToDelete(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Excluir Módulo</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Tem certeza que deseja excluir o módulo "{courseToDelete?.title}"?
              <br />
              <span className="text-red-400 font-medium">
                Esta ação é irreversível e excluirá também todas as {courseToDelete?.lessons?.length || 0} aulas do módulo.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => courseToDelete && deleteCourse.mutate(courseToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Módulo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação para excluir aula */}
      <AlertDialog open={!!lessonToDelete} onOpenChange={() => setLessonToDelete(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Excluir Aula</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Tem certeza que deseja excluir a aula "{lessonToDelete?.title}"?
              <br />
              <span className="text-red-400 font-medium">Esta ação é irreversível.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => lessonToDelete && deleteLesson.mutate(lessonToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Aula
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default Courses; 