import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Users, 
  Star,
  Plus,
  Search,
  Youtube,
  Video,
  Edit,
  Trash2,
  GraduationCap
} from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  platform: string | null;
  duration_seconds: number | null;
  order_index: number;
}

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
    thumbnail_url: ''
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
      const { data, error } = await supabase
        .from('courses')
        .insert([{
          title: courseData.title,
          description: courseData.description,
          thumbnail_url: courseData.thumbnail_url,
        is_active: true
        }])
        .select()
        .single();

        if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Curso criado!",
        description: "Novo curso foi adicionado com sucesso.",
      });
      setShowAddCourse(false);
      setNewCourse({ title: '', description: '', thumbnail_url: '' });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar curso",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation para criar aula
  const createLessonMutation = useMutation({
    mutationFn: async (lessonData: typeof newLesson) => {
      const durationInSeconds = lessonData.duration ? 
        parseInt(lessonData.duration.split(':')[0]) * 60 + parseInt(lessonData.duration.split(':')[1] || '0') : 
        null;

      const { data, error } = await supabase
        .from('lessons')
        .insert([{
          course_id: lessonData.course_id,
          title: lessonData.title,
          description: lessonData.description,
          video_url: lessonData.video_url,
          platform: lessonData.platform,
          duration_seconds: durationInSeconds,
          is_active: true,
          order_index: 1
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Aula adicionada!",
        description: "Nova aula foi criada com sucesso.",
      });
      setShowAddLesson(false);
      setNewLesson({ title: '', description: '', video_url: '', platform: 'youtube', duration: '', course_id: '' });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar aula",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const filteredCourses = courses?.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getPlatformIcon = (platform: string | null) => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="h-4 w-4 text-red-500" />;
      case 'vimeo':
        return <Video className="h-4 w-4 text-blue-500" />;
      default:
        return <Play className="h-4 w-4 text-orange-400" />;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = (lessons: Lesson[]) => {
    const total = lessons.reduce((acc, lesson) => acc + (lesson.duration_seconds || 0), 0);
    return formatDuration(total);
  };

  return (
    <PageLayout
      fullWidth={true}
      headerContent={
          <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Aulas Elite"
            description="Acesse conteúdos exclusivos e treinamentos premium para afiliados"
            icon="🎓"
          />
        </div>
      }
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header com busca e ações */}
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar cursos e aulas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
              </div>
              
          {isAdmin() && (
            <div className="flex gap-3">
              <Dialog open={showAddCourse} onOpenChange={setShowAddCourse}>
                  <DialogTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                    Novo Curso
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-xl bg-slate-800 border-slate-700">
                    <DialogHeader>
                    <DialogTitle className="text-white">Criar Novo Curso</DialogTitle>
                    </DialogHeader>
                  <div className="space-y-4">
                    <div>
                          <Label htmlFor="title" className="text-slate-200">Título do Curso</Label>
                          <Input
                            id="title"
                        value={newCourse.title}
                        onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Ex: Marketing Digital para Afiliados"
                          />
                        </div>
                    <div>
                      <Label htmlFor="description" className="text-slate-200">Descrição</Label>
                          <Textarea
                            id="description"
                        value={newCourse.description}
                        onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Descreva o conteúdo e objetivos do curso"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="thumbnail" className="text-slate-200">URL da Imagem (opcional)</Label>
                      <Input
                        id="thumbnail"
                        value={newCourse.thumbnail_url}
                        onChange={(e) => setNewCourse({...newCourse, thumbnail_url: e.target.value})}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={() => createCourseMutation.mutate(newCourse)}
                        disabled={createCourseMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {createCourseMutation.isPending ? 'Criando...' : 'Criar Curso'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddCourse(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showAddLesson} onOpenChange={setShowAddLesson}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <Video className="h-4 w-4 mr-2" />
                    Nova Aula
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Adicionar Nova Aula</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="course" className="text-slate-200">Curso</Label>
                      <Select value={newLesson.course_id} onValueChange={(value) => setNewLesson({...newLesson, course_id: value})}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Selecione um curso" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses?.map(course => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="lessonTitle" className="text-slate-200">Título da Aula</Label>
                      <Input
                        id="lessonTitle"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Ex: Introdução ao Tráfego Pago"
                          />
                        </div>
                    <div>
                      <Label htmlFor="videoUrl" className="text-slate-200">URL do Vídeo</Label>
                      <Input
                        id="videoUrl"
                        value={newLesson.video_url}
                        onChange={(e) => setNewLesson({...newLesson, video_url: e.target.value})}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        📺 Suporte completo: YouTube, Vimeo, Wistia e outros players
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="platform" className="text-slate-200">Plataforma</Label>
                        <Select value={newLesson.platform} onValueChange={(value) => setNewLesson({...newLesson, platform: value})}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="youtube">YouTube</SelectItem>
                            <SelectItem value="vimeo">Vimeo</SelectItem>
                            <SelectItem value="wistia">Wistia</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="duration" className="text-slate-200">Duração</Label>
                        <Input
                          id="duration"
                          value={newLesson.duration}
                          onChange={(e) => setNewLesson({...newLesson, duration: e.target.value})}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Ex: 15:30"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => createLessonMutation.mutate(newLesson)}
                        disabled={createLessonMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {createLessonMutation.isPending ? 'Adicionando...' : 'Adicionar Aula'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddLesson(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                  </DialogContent>
                </Dialog>
            </div>
          )}
      </div>

        {/* Lista de Cursos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            [...Array(6)].map((_, i) => (
              <Card key={i} className="bg-slate-800/60 border-slate-700/50 animate-pulse">
                <div className="w-full h-48 bg-slate-700 rounded-t-lg"></div>
                  <CardHeader>
                  <div className="h-6 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-700 rounded w-full"></div>
                  </CardHeader>
                </Card>
            ))
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <Card key={course.id} className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div 
                  className="relative"
                  onClick={() => navigate(`/dashboard/content/${course.id}`)}
                >
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                        />
                      ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-slate-700 to-slate-800 rounded-t-lg flex items-center justify-center">
                      <GraduationCap className="h-16 w-16 text-slate-500" />
                        </div>
                      )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg flex items-center justify-center">
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      <Play className="h-4 w-4 mr-2" />
                      Assistir
                    </Button>
                      </div>

                  {course.lessons && (
                    <Badge className="absolute top-3 right-3 bg-orange-500 text-white">
                      {course.lessons.length} aulas
                    </Badge>
                  )}
                  
                  {isAdmin() && (
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-slate-800/80 text-blue-400 hover:text-blue-300">
                            <Edit className="h-4 w-4" />
                          </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-slate-800/80 text-red-400 hover:text-red-300">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-white group-hover:text-orange-300 transition-colors">
                    {course.title}
                  </CardTitle>
                  <p className="text-slate-400 text-sm line-clamp-2">{course.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.lessons ? getTotalDuration(course.lessons) : '0:00'}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.lessons?.length || 0} aulas
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      Elite
                    </div>
                  </div>

                  {/* Preview das Aulas */}
                  {course.lessons && course.lessons.length > 0 && (
                    <div className="border-t border-slate-700 pt-4">
                      <p className="text-sm font-medium text-slate-300 mb-2">Aulas do curso:</p>
                      <div className="space-y-1">
                        {course.lessons.slice(0, 3).map((lesson) => (
                          <div key={lesson.id} className="flex items-center gap-2 text-xs text-slate-500">
                            {getPlatformIcon(lesson.platform)}
                            <span className="flex-1 truncate">{lesson.title}</span>
                            <span>{formatDuration(lesson.duration_seconds)}</span>
                          </div>
                        ))}
                        {course.lessons.length > 3 && (
                          <p className="text-xs text-slate-400 pl-6">
                            +{course.lessons.length - 3} aulas adicionais
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                        <Button 
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white"
                    onClick={() => navigate(`/dashboard/content/${course.id}`)}
                        >
                    Acessar Curso
                        </Button>
                </CardContent>
                  </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <GraduationCap className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm ? 'Nenhum curso encontrado' : 'Nenhum curso disponível'}
              </h3>
              <p className="text-slate-400">
                {searchTerm 
                  ? 'Tente ajustar sua busca ou explore outras categorias.'
                  : 'Novos cursos serão adicionados em breve. Fique atento!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Courses; 