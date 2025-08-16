# 🚀 Scripts de Despliegue - Hybrid API Gateway

Scripts automatizados para desplegar, gestionar y monitorear el API Gateway en OVH Kubernetes.

## 📁 Archivos

- **`deploy.ps1`** - Script de despliegue completo
- **`undeploy.ps1`** - Script de eliminación completa
- **`status.ps1`** - Script de verificación de estado

## 🚀 Despliegue

### Despliegue básico
```powershell
.\scripts\deploy.ps1
```

### Despliegue con opciones
```powershell
# Desplegar en namespace específico
.\scripts\deploy.ps1 -Namespace "mi-namespace"

# Omitir construcción de imagen Docker
.\scripts\deploy.ps1 -SkipBuild

# Omitir subida de imagen al registro
.\scripts\deploy.ps1 -SkipPush

# Combinar opciones
.\scripts\deploy.ps1 -Namespace "prod" -SkipBuild -SkipPush
```

### Parámetros disponibles
- `-Namespace`: Namespace de Kubernetes (default: "hybrid")
- `-Registry`: Registro de contenedores OVH (default: "wz76yl02.c1.bhs5.container-registry.ovh.net")
- `-ImageName`: Nombre de la imagen (default: "hybrid/hybrid-gateway")
- `-Tag`: Tag de la imagen (default: "latest")
- `-SkipBuild`: Omitir construcción de imagen Docker
- `-SkipPush`: Omitir subida de imagen al registro

## 🗑️ Eliminación

### Eliminación con confirmación
```powershell
.\scripts\undeploy.ps1
```

### Eliminación forzada
```powershell
# Eliminar sin confirmación
.\scripts\undeploy.ps1 -Force

# Mantener el namespace
.\scripts\undeploy.ps1 -KeepNamespace

# Combinar opciones
.\scripts\undeploy.ps1 -Force -KeepNamespace
```

### Parámetros disponibles
- `-Namespace`: Namespace a eliminar (default: "hybrid")
- `-Force`: Eliminar sin confirmación
- `-KeepNamespace`: Mantener el namespace

## 📊 Verificación de Estado

### Estado básico
```powershell
.\scripts\status.ps1
```

### Estado detallado
```powershell
# Información detallada con logs y eventos
.\scripts\status.ps1 -Detailed

# Modo watch (actualización cada 10 segundos)
.\scripts\status.ps1 -Watch

# Combinar opciones
.\scripts\status.ps1 -Detailed -Watch
```

### Parámetros disponibles
- `-Namespace`: Namespace a verificar (default: "hybrid")
- `-Detailed`: Mostrar información detallada
- `-Watch`: Modo watch continuo

## 🔄 Flujo de Trabajo Típico

### 1. Despliegue inicial
```powershell
.\scripts\deploy.ps1
```

### 2. Verificar estado
```powershell
.\scripts\status.ps1 -Detailed
```

### 3. Monitorear en tiempo real
```powershell
.\scripts\status.ps1 -Watch
```

### 4. Actualizar despliegue
```powershell
# Reconstruir y desplegar
.\scripts\deploy.ps1

# Solo actualizar configuración (sin rebuild)
.\scripts\deploy.ps1 -SkipBuild -SkipPush
```

### 5. Eliminar despliegue
```powershell
.\scripts\undeploy.ps1
```

## 🛠️ Requisitos Previos

### Software necesario
- **PowerShell 5.1+** o **PowerShell Core 6+**
- **kubectl** configurado y conectado al cluster OVH
- **Docker** instalado y funcionando
- **Acceso al registro de contenedores OVH**

### Configuración de kubectl
```powershell
# Verificar conexión
kubectl cluster-info

# Verificar contexto
kubectl config current-context
```

### Configuración de Docker
```powershell
# Verificar Docker
docker version

# Login al registro OVH (si es necesario)
docker login wz76yl02.c1.bhs5.container-registry.ovh.net
```

## 🔧 Solución de Problemas

### Error: kubectl no está configurado
```powershell
# Descargar kubeconfig desde OVH Cloud
# Configurar la variable de entorno
$env:KUBECONFIG = "ruta\al\kubeconfig"
```

### Error: Docker no está disponible
```powershell
# Verificar que Docker Desktop esté ejecutándose
# O usar Docker en WSL2
```

### Error: Imagen no encontrada
```powershell
# Verificar que la imagen existe en el registro
docker pull wz76yl02.c1.bhs5.container-registry.ovh.net/hybrid/hybrid-gateway:latest
```

### Error: Namespace no existe
```powershell
# Crear namespace manualmente
kubectl create namespace hybrid
```

## 📋 Comandos Manuales Útiles

### Ver logs en tiempo real
```powershell
kubectl logs -f deployment/hybrid-gateway -n hybrid
```

### Escalar deployment
```powershell
kubectl scale deployment hybrid-gateway --replicas=3 -n hybrid
```

### Reiniciar deployment
```powershell
kubectl rollout restart deployment/hybrid-gateway -n hybrid
```

### Ver eventos
```powershell
kubectl get events -n hybrid --sort-by='.lastTimestamp'
```

### Ver recursos utilizados
```powershell
kubectl top pods -n hybrid
```

## 🎯 Próximos Pasos

1. **Configurar dominio** en OVH Domain
2. **Instalar cert-manager** para SSL automático
3. **Configurar monitoreo** con Prometheus/Grafana
4. **Desplegar microservicios** adicionales
5. **Configurar CI/CD** con GitLab

## 📞 Soporte

Para problemas o preguntas:
- Revisar logs: `kubectl logs deployment/hybrid-gateway -n hybrid`
- Verificar eventos: `kubectl get events -n hybrid`
- Usar modo debug: `.\scripts\status.ps1 -Detailed` 