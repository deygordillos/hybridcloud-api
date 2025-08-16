# Script de eliminacion simplificado para Hybrid API Auth Service
param(
    [string]$Namespace = "hybrid"
)

Write-Host "Eliminando Hybrid API Auth Service..." -ForegroundColor Red

# Verificar kubectl
try {
    kubectl cluster-info | Out-Null
    Write-Host "kubectl configurado correctamente" -ForegroundColor Green
} catch {
    Write-Host "Error: kubectl no esta configurado" -ForegroundColor Red
    exit 1
}

# Eliminar recursos
Write-Host "Eliminando recursos..." -ForegroundColor Yellow
kubectl delete -f k8s/ -n $Namespace

# Eliminar deployment si existe
kubectl delete deployment hybrid-auth-service -n $Namespace 2>$null

# Eliminar HPA si existe
kubectl delete hpa hybrid-auth-service-hpa -n $Namespace 2>$null

# Mostrar estado final
Write-Host "Estado final:" -ForegroundColor Cyan
kubectl get all -n $Namespace

Write-Host "Eliminacion completada!" -ForegroundColor Green 