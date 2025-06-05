import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Clock, 
  BookOpen, 
  ArrowLeft, 
  Download, 
  CheckCircle2,
  Lock,
  FileText,
  Video
} from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import MaterialDownloadButton from '@/components/content/MaterialDownloadButton';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_seconds: number | null;
  order_index: number;
  is_active: boolean;
}

interface Material {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  lessons: Lesson[];
  materials: Material[];
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [watchedLessons, setWatchedLessons] = useState<Set<string>>(new Set());

  // Buscar detalhes do curso com aulas e materiais
  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          lessons:lessons(*),
          materials:materials(*)
        `)
        .eq('id', courseId)
        .single();

      if (error) throw error;
      
      // Ordenar aulas por order_index
      if (data.lessons) {
        data.lessons.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index);
      }
      
      return data as Course;
    },
    enabled: !!courseId
  });

  // Selecionar primeira aula automaticamente
  React.useEffect(() => {
    if (course?.lessons && course.lessons.length > 0 && !selectedLesson) {
      setSelectedLesson(course.lessons[0]);
    }
  }, [course, selectedLesson]);

  const handleLessonComplete = (lessonId: string) => {
    setWatchedLessons(prev => new Set(prev).add(lessonId));
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    // Marcar como assistida quando selecionar
    if (lesson.video_url) {
      handleLessonComplete(lesson.id);
    }
  };

  const getTotalDuration = () => {
    if (!course?.lessons) return 0;
    return course.lessons.reduce((total, lesson) => total + (lesson.duration_seconds || 0), 0);
  };

  const getProgress = () => {
    if (!course?.lessons || course.lessons.length === 0) return 0;
    return Math.round((watchedLessons.size / course.lessons.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-96 w-full mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Curso não encontrado</h1>
        <Button onClick={() => navigate('/dashboard/content')}>
          Voltar para cursos
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-orange-600/20 to-background">
        <div className="container mx-auto px-6 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/content')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para cursos
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course Info */}
            <div className="lg:col-span-2 space-y-4">
              <h1 className="text-4xl font-bold text-gradient-orange">
                {course.title}
              </h1>
              
              {course.description && (
                <p className="text-lg text-muted-foreground">
                  {course.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4">
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {course.lessons.length} aulas
                </Badge>
                <Badge variant="outline">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDuration(getTotalDuration())}
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  {getProgress()}% concluído
                </Badge>
              </div>
            </div>

            {/* Course Thumbnail */}
            <div className="relative aspect-video lg:aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-orange-500/20 to-orange-600/20">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <BookOpen className="h-16 w-16 text-orange-500/50" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player Area */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <Card className="overflow-hidden">
                {selectedLesson.video_url ? (
                  <div className="aspect-video bg-black">
                    <video
                      key={selectedLesson.id}
                      controls
                      className="w-full h-full"
                      src={selectedLesson.video_url}
                    >
                      Seu navegador não suporta vídeos HTML5.
                    </video>
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Lock className="h-16 w-16 text-orange-500 mx-auto" />
                      <p className="text-lg font-medium">Vídeo não disponível</p>
                      <p className="text-sm text-muted-foreground">
                        Esta aula ainda não possui vídeo disponível
                      </p>
                    </div>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl">
                        {selectedLesson.title}
                      </CardTitle>
                      {selectedLesson.description && (
                        <CardDescription className="mt-2">
                          {selectedLesson.description}
                        </CardDescription>
                      )}
                    </div>
                    {watchedLessons.has(selectedLesson.id) && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Assistida
                      </Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg">Selecione uma aula para começar</p>
              </Card>
            )}

            {/* Materials Tab */}
            {course.materials.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Materiais de Apoio</CardTitle>
                  <CardDescription>
                    Baixe os materiais complementares do curso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {course.materials.map((material) => (
                      <MaterialDownloadButton
                        key={material.id}
                        material={material}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Lessons List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo do Curso</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-1 p-4">
                    {course.lessons.map((lesson, index) => {
                      const isWatched = watchedLessons.has(lesson.id);
                      const isSelected = selectedLesson?.id === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonSelect(lesson)}
                          className={`w-full text-left p-4 rounded-lg transition-all ${
                            isSelected
                              ? 'bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-500'
                              : 'hover:bg-secondary/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 ${isWatched ? 'text-green-600' : 'text-muted-foreground'}`}>
                              {isWatched ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <Play className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className={`font-medium ${isSelected ? 'text-orange-600' : ''}`}>
                                {index + 1}. {lesson.title}
                              </p>
                              {lesson.duration_seconds && (
                                <p className="text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {formatDuration(lesson.duration_seconds)}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail; 