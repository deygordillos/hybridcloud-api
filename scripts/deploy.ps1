# Script de despliegue simplificado para Hybrid API General
param(
    [string]$Namespace = "hybrid"
)

Write-Host "Iniciando despliegue de Hybrid API General..." -ForegroundColor Green

# Verificar kubectl
try {
    kubectl cluster-info | Out-Null
    Write-Host "kubectl configurado correctamente" -ForegroundColor Green
} catch {
    Write-Host "Error: kubectl no esta configurado" -ForegroundColor Red
    exit 1
}

# Crear namespace si no existe
try {
    kubectl get namespace $Namespace | Out-Null
    Write-Host "Namespace $Namespace ya existe" -ForegroundColor Green
} catch {
    Write-Host "Creando namespace $Namespace..." -ForegroundColor Yellow
    kubectl create namespace $Namespace
}

# Construir imagen Docker
Write-Host "Construyendo imagen Docker..." -ForegroundColor Yellow
docker build -t hybrid-api-ts:1.3.5 .

# Etiquetar imagen para OVH
Write-Host "Etiquetando imagen para registro OVH..." -ForegroundColor Yellow
docker tag hybrid-api-ts:1.3.5 286325yk.c1.bhs5.container-registry.ovh.net/hybrid/hybrid-api-ts:1.3.5

# Subir imagen
Write-Host "Subiendo imagen al registro..." -ForegroundColor Yellow
docker push 286325yk.c1.bhs5.container-registry.ovh.net/hybrid/hybrid-api-ts:1.3.5

# Aplicar configuraciones
# Write-Host "Verificando CRD ServiceMonitor..." -ForegroundColor Yellow
# $serviceMonitorCRD = kubectl get crd servicemonitors.monitoring.coreos.com 2>$null
# if ($LASTEXITCODE -ne 0) {
#     Write-Host "CRD ServiceMonitor no encontrado. Instalando..." -ForegroundColor Yellow
#     kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/example/prometheus-operator-crd/monitoring.coreos.com_servicemonitors.yaml
#     if ($LASTEXITCODE -eq 0) {
#         Write-Host "CRD ServiceMonitor instalado correctamente." -ForegroundColor Green
#     } else {
#         Write-Host "No se pudo instalar el CRD ServiceMonitor." -ForegroundColor Red
#         exit 1
#     }
# } else {
#     Write-Host "CRD ServiceMonitor ya está instalado." -ForegroundColor Green
# }

Write-Host "Aplicando configuraciones de Kubernetes..." -ForegroundColor Yellow
kubectl apply -f k8s/1.configmap.yml -n $Namespace
kubectl apply -f k8s/2.secret.yml -n $Namespace
kubectl apply -f k8s/3.deployment.yml -n $Namespace
kubectl apply -f k8s/4.hpa.yml -n $Namespace
kubectl apply -f k8s/5.monitoring.yml -n $Namespace
# Esperar deployment
Write-Host "Esperando que el deployment este listo..." -ForegroundColor Yellow
kubectl rollout status deployment/hybrid-auth-service -n $Namespace

# Mostrar estado final
Write-Host "Estado final:" -ForegroundColor Cyan
kubectl get pods -n $Namespace
kubectl get services -n $Namespace

Write-Host "Despliegue completado!" -ForegroundColor Green 