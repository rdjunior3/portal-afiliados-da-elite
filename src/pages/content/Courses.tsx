import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Play, Clock, BookOpen, GraduationCap, Plus, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { formatDuration } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  lessons?: {
    id: string;
    duration_seconds: number | null;
  }[];
}

interface CourseForm {
  title: string;
  description: string;
  thumbnail_url: string;
}

const Courses = () => {
  const navigate = useNavigate();
  const { canManageContent } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState<CourseForm>({
    title: '',
    description: '',
    thumbnail_url: ''
  });

  // Buscar cursos com contagem de aulas
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('courses')
        .select(`
          *,
          lessons:lessons(id, duration_seconds)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Course[];
    }
  });

  // Mutation para criar/editar curso
  const saveCourseMutation = useMutation({
    mutationFn: async (data: CourseForm) => {
      const courseData = {
        ...data,
        is_active: true
      };

      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('courses')
          .insert([courseData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsCourseModalOpen(false);
      setEditingCourse(null);
      setCourseForm({
        title: '',
        description: '',
        thumbnail_url: ''
      });
      toast({
        title: editingCourse ? "Curso atualizado!" : "Curso criado!",
        description: editingCourse ? "O curso foi atualizado com sucesso." : "O curso foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o curso. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Mutation para deletar curso
  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('courses')
        .update({ is_active: false })
        .eq('id', courseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Curso removido!",
        description: "O curso foi removido com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o curso. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description || '',
      thumbnail_url: course.thumbnail_url || ''
    });
    setIsCourseModalOpen(true);
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      title: '',
      description: '',
      thumbnail_url: ''
    });
    setIsCourseModalOpen(true);
  };

  const getTotalDuration = (lessons: Course['lessons']) => {
    if (!lessons) return 0;
    return lessons.reduce((total, lesson) => total + (lesson.duration_seconds || 0), 0);
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/dashboard/content/course/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-orange-600/20 to-transparent pb-32 pt-20">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px]" />
        
        <div className="w-full px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div className="text-center space-y-4 flex-1">
                <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
                  <span className="text-4xl">🏆</span>
                  Área de Aulas Elite
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                  {canManageContent() ? 'Gerencie aulas e eduque afiliados' : 'Aprenda com os melhores conteúdos e acelere sua jornada como afiliado'}
                </p>
              </div>
              
              {canManageContent() && (
                <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={handleCreateCourse}
                      className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Curso
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl bg-slate-800/95 backdrop-blur border-slate-700/50">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        {editingCourse ? 'Editar Curso' : 'Cadastrar Novo Curso'}
                      </DialogTitle>
                      <DialogDescription className="text-slate-300">
                        {editingCourse ? 'Atualize as informações do curso' : 'Preencha as informações para criar um novo curso'}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4 max-h-[70vh] overflow-y-auto">
                      {/* Coluna da Imagem */}
                      <div className="lg:col-span-1">
                        <ImageUpload
                          value={courseForm.thumbnail_url}
                          onChange={(url) => setCourseForm({...courseForm, thumbnail_url: url})}
                          bucket="courses"
                          folder="thumbnails"
                          label="Imagem do Curso"
                          placeholder="Envie uma imagem do curso"
                          maxWidth={500}
                          maxHeight={500}
                        />
                      </div>
                      
                      {/* Coluna dos Campos */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-slate-200">Título do Curso</Label>
                          <Input
                            id="title"
                            value={courseForm.title}
                            onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                            className="bg-slate-700/60 border-slate-600/50 text-white backdrop-blur-sm"
                            placeholder="Título do curso"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-slate-200">Descrição do Curso</Label>
                          <Textarea
                            id="description"
                            value={courseForm.description}
                            onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                            className="bg-slate-700/60 border-slate-600/50 text-white backdrop-blur-sm"
                            placeholder="Descrição detalhada do curso"
                            rows={6}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter className="pt-6 border-t border-slate-700/50">
                      <Button
                        type="submit"
                        onClick={() => saveCourseMutation.mutate(courseForm)}
                        disabled={saveCourseMutation.isPending}
                        className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white px-8"
                      >
                        {saveCourseMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Salvando...
                          </>
                        ) : (
                          editingCourse ? 'Atualizar Curso' : 'Cadastrar Curso'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  placeholder="Buscar cursos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-slate-800/60 backdrop-blur border-slate-600/50 text-white focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="w-full px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
                  <Skeleton className="aspect-video w-full bg-slate-700/50" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 bg-slate-700/50" />
                    <Skeleton className="h-4 w-full mt-2 bg-slate-700/50" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : courses && courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course) => {
                const totalDuration = getTotalDuration(course.lessons);
                const lessonCount = course.lessons?.length || 0;

                return (
                  <Card
                    key={course.id}
                    className="overflow-hidden cursor-pointer group hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 bg-slate-800/60 border-slate-700/50 backdrop-blur-sm"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gradient-to-br from-slate-900/40 to-slate-800/40">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <GraduationCap className="h-16 w-16 text-slate-500/50" />
                        </div>
                      )}

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-orange-500/90 backdrop-blur-sm rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                          <Play className="h-8 w-8 text-white fill-white" />
                        </div>
                      </div>

                      {/* Admin Actions */}
                      {canManageContent() && (
                        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCourse(course);
                            }}
                            className="h-8 w-8 p-0 bg-slate-800/80 backdrop-blur-sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCourseMutation.mutate(course.id);
                            }}
                            className="h-8 w-8 p-0 bg-red-600/80 backdrop-blur-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {/* Course Info Badge */}
                      <div className="absolute bottom-2 right-2 flex gap-2">
                        {lessonCount > 0 && (
                          <Badge className="bg-black/70 text-white border-0 backdrop-blur-sm">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {lessonCount} aulas
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardHeader className="space-y-2 pb-4">
                      <CardTitle className="line-clamp-2 text-white group-hover:text-orange-300 transition-colors">
                        {course.title}
                      </CardTitle>
                      {course.description && (
                        <CardDescription className="line-clamp-3 text-slate-300">
                          {course.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardFooter className="pt-0 border-t border-slate-700/50">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center text-sm text-slate-400">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(totalDuration)}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                        >
                          Assistir
                          <Play className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
              <GraduationCap className="h-16 w-16 mx-auto text-slate-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">Nenhum curso disponível</h3>
              <p className="text-slate-400">
                {searchQuery 
                  ? 'Nenhum curso encontrado com sua busca. Tente outros termos.'
                  : 'Em breve novos cursos estarão disponíveis para você.'}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Featured Section */}
      {courses && courses.length > 3 && (
        <div className="w-full px-4 sm:px-6 lg:px-8 mt-16 pb-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-orange-300 flex items-center gap-2">
              <span className="text-xl">🏆</span>
              Continue Assistindo
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {courses.slice(0, 6).map((course) => (
                <div
                  key={course.id}
                  className="cursor-pointer group"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-slate-900/40 to-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <GraduationCap className="h-8 w-8 text-slate-500/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                  </div>
                  <p className="mt-2 text-sm font-medium line-clamp-2 text-slate-300 group-hover:text-orange-300 transition-colors">
                    {course.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses; 