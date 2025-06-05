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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/ImageUpload';
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
  GraduationCap,
  Image as ImageIcon
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
  cover_image_url: string | null;
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
              {/* Dialog para Criar Novo Curso - Melhorado */}
              <Dialog open={showAddCourse} onOpenChange={setShowAddCourse}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Curso
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-orange-400" />
                      Criar Novo Curso
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    {/* Informações Básicas */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-slate-200 font-medium">Título do Curso *</Label>
                        <Input
                          id="title"
                          value={newCourse.title}
                          onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                          className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                          placeholder="Ex: Marketing Digital para Afiliados Elite"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description" className="text-slate-200 font-medium">Descrição</Label>
                        <Textarea
                          id="description"
                          value={newCourse.description}
                          onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                          className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                          placeholder="Descreva o conteúdo e objetivos do curso..."
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Upload de Imagem de Capa */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-orange-400" />
                        <Label className="text-slate-200 font-medium">Imagem de Capa do Curso</Label>
                      </div>
                      <ImageUpload
                        value={newCourse.cover_image_url}
                        onChange={(url) => setNewCourse({...newCourse, cover_image_url: url})}
                        bucket="course-covers"
                        folder="courses"
                        label="Enviar imagem de capa"
                        placeholder="Clique para enviar ou arraste uma imagem de capa"
                        maxWidth={1280}
                        maxHeight={720}
                        className="h-48"
                      />
                      <p className="text-xs text-slate-400">
                        📐 Tamanho ideal: 1280x720px (proporção 16:9). Formatos aceitos: JPG, PNG, WEBP
                      </p>
                    </div>
                  </div>
                  
                  <DialogFooter className="gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddCourse(false)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => createCourseMutation.mutate(newCourse)}
                      disabled={createCourseMutation.isPending || !newCourse.title.trim()}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white"
                    >
                      {createCourseMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Criar Curso
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Dialog para Adicionar Nova Aula - Melhorado */}
              <Dialog open={showAddLesson} onOpenChange={setShowAddLesson}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <Video className="h-4 w-4 mr-2" />
                    Nova Aula
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                      <Video className="h-5 w-5 text-blue-400" />
                      Adicionar Nova Aula
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="course" className="text-slate-200 font-medium">Curso *</Label>
                        <Select value={newLesson.course_id} onValueChange={(value) => setNewLesson({...newLesson, course_id: value})}>
                          <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                            <SelectValue placeholder="Selecione um curso" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {courses?.map(course => (
                              <SelectItem key={course.id} value={course.id} className="text-white">
                                {course.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="lessonTitle" className="text-slate-200 font-medium">Título da Aula *</Label>
                        <Input
                          id="lessonTitle"
                          value={newLesson.title}
                          onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                          className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                          placeholder="Ex: Introdução ao Tráfego Pago"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="videoUrl" className="text-slate-200 font-medium">URL do Vídeo *</Label>
                        <Input
                          id="videoUrl"
                          value={newLesson.video_url}
                          onChange={(e) => setNewLesson({...newLesson, video_url: e.target.value})}
                          className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          📺 Suporte para: YouTube, Vimeo, Wistia e outros players de vídeo
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="platform" className="text-slate-200 font-medium">Plataforma</Label>
                        <Select value={newLesson.platform} onValueChange={(value) => setNewLesson({...newLesson, platform: value})}>
                          <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="youtube" className="text-white">YouTube</SelectItem>
                            <SelectItem value="vimeo" className="text-white">Vimeo</SelectItem>
                            <SelectItem value="wistia" className="text-white">Wistia</SelectItem>
                            <SelectItem value="other" className="text-white">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="duration" className="text-slate-200 font-medium">Duração</Label>
                        <Input
                          id="duration"
                          value={newLesson.duration}
                          onChange={(e) => setNewLesson({...newLesson, duration: e.target.value})}
                          className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                          placeholder="Ex: 15:30"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="lessonDescription" className="text-slate-200 font-medium">Descrição da Aula</Label>
                        <Textarea
                          id="lessonDescription"
                          value={newLesson.description}
                          onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                          className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                          placeholder="Descreva o conteúdo desta aula..."
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter className="gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddLesson(false)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => createLessonMutation.mutate(newLesson)}
                      disabled={createLessonMutation.isPending || !newLesson.title.trim() || !newLesson.course_id || !newLesson.video_url.trim()}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white"
                    >
                      {createLessonMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Adicionando...
                        </>
                      ) : (
                        <>
                          <Video className="h-4 w-4 mr-2" />
                          Adicionar Aula
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Lista de Cursos - Layout melhorado */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton melhorado
            [...Array(6)].map((_, i) => (
              <Card key={i} className="bg-slate-800/60 border-slate-700/50 animate-pulse">
                <div className="w-full h-48 bg-slate-700 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-full mb-1"></div>
                  <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                </CardHeader>
                <div className="p-6 pt-0">
                  <div className="h-10 bg-slate-700 rounded"></div>
                </div>
              </Card>
            ))
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <Card key={course.id} className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div 
                  className="relative"
                  onClick={() => navigate(`/dashboard/content/${course.id}`)}
                >
                  {course.cover_image_url || course.thumbnail_url ? (
                    <img
                      src={course.cover_image_url || course.thumbnail_url!}
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
                  ? 'Tente pesquisar com outros termos ou limpe o filtro para ver todos os cursos.'
                  : 'Em breve teremos conteúdos exclusivos para elevar seus resultados como afiliado.'}
              </p>
              {!searchTerm && isAdmin() && (
                <Button 
                  className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500"
                  onClick={() => setShowAddCourse(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Curso
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Courses; 