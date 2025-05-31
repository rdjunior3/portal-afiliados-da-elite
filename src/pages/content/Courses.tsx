import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Play, Clock, BookOpen, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDuration } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  lessons?: {
    id: string;
    duration_seconds: number | null;
  }[];
}

const Courses = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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

  const getTotalDuration = (lessons: Course['lessons']) => {
    if (!lessons) return 0;
    return lessons.reduce((total, lesson) => total + (lesson.duration_seconds || 0), 0);
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/dashboard/content/course/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-orange-600/20 to-background pb-32 pt-20">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px]" />
        
        <div className="container mx-auto px-6 relative">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-5xl font-bold text-gradient-orange">
              Área de Aulas
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Aprenda com os melhores conteúdos e acelere sua jornada como afiliado
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Buscar cursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-background/50 backdrop-blur border-white/10 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid - Netflix Style */}
      <div className="container mx-auto px-6 -mt-20 relative z-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden bg-card/50 backdrop-blur">
                <Skeleton className="aspect-video w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full mt-2" />
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
                  className="overflow-hidden cursor-pointer group hover-lift card-hover bg-card/50 backdrop-blur border-white/10"
                  onClick={() => handleCourseClick(course.id)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-orange-500/20 to-orange-600/20">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <GraduationCap className="h-16 w-16 text-orange-500/50" />
                      </div>
                    )}

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-orange-500 rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                        <Play className="h-8 w-8 text-white fill-white" />
                      </div>
                    </div>

                    {/* Course Info Badge */}
                    <div className="absolute bottom-2 right-2 flex gap-2">
                      {lessonCount > 0 && (
                        <Badge className="bg-black/70 text-white border-0">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {lessonCount} aulas
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardHeader className="space-y-2">
                    <CardTitle className="line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {course.title}
                    </CardTitle>
                    {course.description && (
                      <CardDescription className="line-clamp-3">
                        {course.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardFooter className="pt-0">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDuration(totalDuration)}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-orange-600 hover:text-orange-700"
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
          <Card className="p-12 text-center bg-card/50 backdrop-blur">
            <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum curso disponível</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? 'Nenhum curso encontrado com sua busca. Tente outros termos.'
                : 'Em breve novos cursos estarão disponíveis para você.'}
            </p>
          </Card>
        )}
      </div>

      {/* Categories or Featured Section (Optional) */}
      {courses && courses.length > 3 && (
        <div className="container mx-auto px-6 mt-16 pb-16">
          <h2 className="text-2xl font-bold mb-6 text-gradient-orange">
            Continue Assistindo
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {courses.slice(0, 6).map((course) => (
              <div
                key={course.id}
                className="cursor-pointer group"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-orange-500/20 to-orange-600/20">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <GraduationCap className="h-8 w-8 text-orange-500/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                </div>
                <p className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {course.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses; 