import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload as UploadIcon, FileJson, CheckCircle, AlertCircle, Clock, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useScrapingJobs, useUploadFile } from "@/hooks/useScrapingJobs"
import { ScrapingJob } from "@/types/api"

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const { data: jobs } = useScrapingJobs()
  const uploadMutation = useUploadFile()

  const handleUpload = async (file: File) => {
    uploadMutation.mutate(file)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    const jsonFile = files.find(file => file.type === "application/json" || file.name.endsWith('.json'))
    
    if (jsonFile) {
      handleUpload(jsonFile)
    } else {
      toast({
        title: "Archivo inválido",
        description: "Por favor selecciona un archivo JSON válido.",
        variant: "destructive",
      })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Procesando</Badge>
      case 'failed':
        return <Badge variant="destructive">Fallido</Badge>
      default:
        return <Badge variant="secondary">Pendiente</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cargar Datos</h1>
          <p className="text-muted-foreground mt-2">
            Sube archivos JSON con datos de precios de productos automotrices
          </p>
        </div>

        <Card className="glass shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5" />
              Cargar Datos JSON
            </CardTitle>
            <CardDescription>
              Sube archivos JSON con datos de precios de productos automotrices para su análisis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Área de drag & drop */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileJson className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {selectedFile ? selectedFile.name : "Arrastra tu archivo JSON aquí"}
                </p>
                <p className="text-sm text-muted-foreground">
                  o
                </p>
                <Label htmlFor="file-upload">
                  <Button variant="outline" asChild>
                    <span>Seleccionar archivo</span>
                  </Button>
                </Label>
                <Input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Información del archivo seleccionado */}
            {selectedFile && (
              <Card className="glass border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileJson className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                      <Button 
                        onClick={() => handleUpload(selectedFile)}
                        disabled={uploadMutation.isPending}
                        className="shadow-md"
                      >
                        {uploadMutation.isPending ? "Cargando..." : "Subir archivo"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Formato esperado */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-base">Formato JSON Esperado</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
{`[
  {
    "Marca": "Toyota",
    "Categoría": "Sedán",
    "Modelo Principal": "Camry",
    "Modelo": "Camry LE",
    "Submodelo": "2024",
    "Precio": 580000,
    "Fecha Scraping": "2024-01-15"
  }
]`}
                </pre>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Historial de trabajos */}
        <Card className="glass shadow-lg">
          <CardHeader>
            <CardTitle>Historial de Cargas</CardTitle>
            <CardDescription>
              Estado de los trabajos de procesamiento de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jobs && jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job: ScrapingJob) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg glass">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(job.status)}
                      <div>
                        <p className="font-medium">Trabajo {job.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(job.created_at).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm">
                          {job.completed_products} / {job.total_products} productos
                        </p>
                        {job.status === 'processing' && (
                          <Progress 
                            value={(job.completed_products / job.total_products) * 100} 
                            className="w-32 mt-1"
                          />
                        )}
                      </div>
                      {getStatusBadge(job.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No hay trabajos de carga registrados</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Sube tu primer archivo JSON para comenzar
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}