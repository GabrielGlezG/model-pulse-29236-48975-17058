import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScrapingJobsService } from "@/services/api";
import { useToast } from "./use-toast";

export function useScrapingJobs() {
  return useQuery({
    queryKey: ['scraping-jobs'],
    queryFn: ScrapingJobsService.getJobs,
    refetchInterval: 5000 // Auto-refresh every 5 seconds
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ScrapingJobsService.uploadFile,
    onSuccess: () => {
      toast({
        title: "Archivo cargado exitosamente",
        description: "El procesamiento comenzará en breve"
      });
      queryClient.invalidateQueries({ queryKey: ['scraping-jobs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al cargar archivo",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive"
      });
    }
  });
}